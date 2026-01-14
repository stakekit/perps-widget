import {
  type EthereumTransaction,
  WalletAPIClient,
  WindowMessageTransport,
} from "@ledgerhq/wallet-api-client";
import { Array as _Array, Effect } from "effect";
import { evmChainsMap } from "@/domain/chains/evm";
import type { SupportedLedgerLiveFamilies } from "@/domain/chains/ledger";
import { SignTransactionError, type WalletAccount } from "@/domain/wallet";
import type { TransactionDto } from "@/services/api-client/api-schemas";
import {
  getFilteredSupportedLedgerFamiliesWithCurrency,
  getLedgerAccounts,
  getLedgerCurrencies,
  isLedgerDappBrowserProvider,
  NoAccountsFoundError,
} from "@/services/ledger-connector/utils";

export class LedgerConnectorService extends Effect.Service<LedgerConnectorService>()(
  "perps/services/ledger-connector-service/LedgerConnectorService",
  {
    effect: Effect.gen(function* () {
      const transport = new WindowMessageTransport();
      transport.connect();
      const walletApiClient = new WalletAPIClient(transport);

      const isEnabled = isLedgerDappBrowserProvider();

      const connect = Effect.gen(function* () {
        /**
         * Create Map<CryptoCurrency['id'], CryptoCurrency['family']>
         * then use TokenCurrency parent to get CryptoCurrency family
         * and add to map TokenCurrency['id'] => CryptoCurrency['family']
         */
        const ledgerCurrencies = yield* getLedgerCurrencies(walletApiClient);
        const parentAccounts = yield* getLedgerAccounts(walletApiClient).pipe(
          Effect.map((allAccounts) =>
            allAccounts.filter((a) => !a.parentAccountId),
          ),
        );

        const filteredSupportedLedgerFamiliesWithCurrency =
          getFilteredSupportedLedgerFamiliesWithCurrency({
            ledgerCurrencies,
            accounts: parentAccounts,
            enabledChainsMap: { evm: evmChainsMap },
          });

        const accountsWithChain = parentAccounts.reduce<WalletAccount[]>(
          (acc, next) => {
            const family = ledgerCurrencies.get(next.currency);

            if (!family) return acc;

            const itemMap = filteredSupportedLedgerFamiliesWithCurrency.get(
              family as SupportedLedgerLiveFamilies,
            );

            if (!family || !itemMap) return acc;

            const chainItem = itemMap.get("*") || itemMap.get(next.currency);

            if (chainItem) {
              acc.push({
                address: next.address,
                chain: chainItem.skChainName,
                id: next.id,
              });
            }

            return acc;
          },
          [],
        );

        const accountWithChain = yield* _Array
          .head(accountsWithChain)
          .pipe(Effect.mapError(() => new NoAccountsFoundError()));

        return {
          currentAccount: accountWithChain,
          accounts: accountsWithChain,
        };
      });

      const transformToLedgerEthereumTransaction = (
        // biome-ignore lint/suspicious/noExplicitAny: temp
        tx: any,
      ): EthereumTransaction => {
        return {
          family: "ethereum" as const,
          amount: tx.value,
          recipient: tx.to,
          nonce: tx.nonce,
          // data: Buffer.from(tx.data.replace(/^0x/, ""), "hex"),
          data: tx.data,
          gasLimit: tx.gasLimit,
          ...(tx.maxFeePerGas && {
            maxFeePerGas: tx.maxFeePerGas,
          }),
          ...(tx.maxPriorityFeePerGas && {
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas,
          }),
          ...(tx.gasPrice && {
            gasPrice: tx.gasPrice,
          }),
        };
      };

      const signTransaction = ({
        account,
        tx,
      }: {
        tx: NonNullable<TransactionDto["signablePayload"]>;
        account: WalletAccount;
      }) =>
        Effect.gen(function* () {
          const deserializedTx = transformToLedgerEthereumTransaction(tx);

          const txHash = yield* Effect.tryPromise({
            try: () =>
              walletApiClient.transaction.signAndBroadcast(
                account.id,
                deserializedTx,
              ),
            catch: (error) => new SignTransactionError({ cause: error }),
          });

          return txHash;
        });

      return {
        connect,
        signTransaction,
        isEnabled,
      };
    }),
  },
) {}
