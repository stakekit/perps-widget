import {
  deserializeTransaction,
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client";
import {
  Array as _Array,
  Effect,
  Layer,
  Schema,
  SubscriptionRef,
} from "effect";
import { evmChainsMap } from "../../../domain/chains/evm";
import type { SupportedLedgerLiveFamilies } from "../../../domain/chains/ledger";
import {
  type AccountsState,
  type LedgerWalletAccount,
  makeLedgerWalletAccount,
  SignTransactionError,
  SwitchAccountError,
} from "../../../domain/signer";
import {
  EIP712Tx,
  EvmTx,
  type Transaction,
  TransactionHash,
} from "../../../domain/transactions";
import { SignerService } from "../signer";
import {
  getFilteredSupportedLedgerFamiliesWithCurrency,
  getLedgerAccounts,
  getLedgerCurrencies,
  NoAccountsFoundError,
} from "./utils";

export const LedgerSignerLayer = Effect.gen(function* () {
  const transport = new WindowMessageTransport();
  transport.connect();
  const walletApiClient = new WalletAPIClient(transport);

  /**
   * Create Map<CryptoCurrency['id'], CryptoCurrency['family']>
   * then use TokenCurrency parent to get CryptoCurrency family
   * and add to map TokenCurrency['id'] => CryptoCurrency['family']
   */
  const ledgerCurrencies = yield* getLedgerCurrencies(walletApiClient);
  const parentAccounts = yield* getLedgerAccounts(walletApiClient).pipe(
    Effect.map((allAccounts) => allAccounts.filter((a) => !a.parentAccountId)),
  );

  const filteredSupportedLedgerFamiliesWithCurrency =
    getFilteredSupportedLedgerFamiliesWithCurrency({
      ledgerCurrencies,
      accounts: parentAccounts,
      enabledChainsMap: { evm: evmChainsMap },
    });

  const uniqueByAddressAccounts = parentAccounts.reduce<LedgerWalletAccount[]>(
    (acc, next) => {
      const family = ledgerCurrencies.get(next.currency);

      if (!family) return acc;

      const itemMap = filteredSupportedLedgerFamiliesWithCurrency.get(
        family as SupportedLedgerLiveFamilies,
      );

      if (!family || !itemMap) return acc;

      const chainItem = itemMap.get("*") || itemMap.get(next.currency);

      if (chainItem) {
        acc.push(
          makeLedgerWalletAccount({
            address: next.address,
            id: next.id,
          }),
        );
      }

      return acc;
    },
    [],
  );

  const accountWithChain = yield* Effect.fromOption(
    _Array.head(uniqueByAddressAccounts),
  ).pipe(Effect.mapError(() => new NoAccountsFoundError()));

  const accountsStateRef = yield* SubscriptionRef.make<
    AccountsState<LedgerWalletAccount>
  >({
    status: "connected",
    currentAccount: accountWithChain,
    accounts: uniqueByAddressAccounts,
  });

  const signMessage = ({
    account,
    transaction,
  }: {
    account: LedgerWalletAccount;
    transaction: typeof EIP712Tx.Type;
  }) =>
    Effect.sync(() => Buffer.from(JSON.stringify(transaction))).pipe(
      Effect.andThen((buffer) =>
        Effect.promise(() => walletApiClient.message.sign(account.id, buffer)),
      ),
      Effect.andThen((buffer) =>
        Effect.sync(() =>
          Schema.decodeSync(TransactionHash)(buffer.toString("hex")),
        ),
      ),
      Effect.mapError((error) => new SignTransactionError({ cause: error })),
    );

  const signEVMTransaction = ({
    account,
    transaction,
  }: {
    account: LedgerWalletAccount;
    transaction: typeof EvmTx.Type;
  }) =>
    Schema.encodeEffect(EvmTx)(transaction).pipe(
      Effect.andThen((tx) =>
        Effect.sync(() =>
          deserializeTransaction({
            ...tx,
            family: "ethereum",
            amount: String(tx.value ?? "0"),
            recipient: tx.to,
            data: tx.data.slice(2),
            gasLimit: tx.gasLimit.toString(),
          }),
        ),
      ),
      Effect.andThen((tx) =>
        Effect.tryPromise(() =>
          walletApiClient.transaction.signAndBroadcast(account.id, tx),
        ),
      ),
      Effect.andThen((hash) =>
        Effect.sync(() => Schema.decodeSync(TransactionHash)(hash)),
      ),
      Effect.mapError((error) => new SignTransactionError({ cause: error })),
    );

  const signTransaction = Effect.fn(function* ({
    transaction,
  }: {
    transaction: Transaction;
  }) {
    const currentAccount = yield* SubscriptionRef.get(accountsStateRef);

    if (currentAccount.status === "disconnected") {
      return yield* Effect.die(new Error("Wallet is disconnected"));
    }

    return yield* Schema.is(EIP712Tx)(transaction)
      ? signMessage({ account: currentAccount.currentAccount, transaction })
      : signEVMTransaction({
          account: currentAccount.currentAccount,
          transaction,
        });
  });

  const switchAccount = Effect.fn(
    function* ({ account }: { account: LedgerWalletAccount }) {
      const newAccount = yield* _Array.findFirst(
        uniqueByAddressAccounts,
        (a) => a.id === account.id,
      );

      yield* SubscriptionRef.update(accountsStateRef, (state) => ({
        ...state,
        currentAccount: newAccount,
      }));
    },
    Effect.mapError((e) => new SwitchAccountError({ cause: e })),
  );

  return SignerService.of({
    type: "ledger",
    signTransaction,
    switchAccount,
    accountsStream: SubscriptionRef.changes(accountsStateRef),
    getAccountState: SubscriptionRef.get(accountsStateRef),
  });
}).pipe(Layer.effect(SignerService));
