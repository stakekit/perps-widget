import type { AppKitNetwork } from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { EvmNetworks } from "@stakekit/common";
import {
  Array as _Array,
  Effect,
  identity,
  Layer,
  Option,
  Record,
  Schema,
  SubscriptionRef,
} from "effect";
import type { NonEmptyArray } from "effect/Array";
import { ChainNotFoundError, defineChain } from "viem";
import { arbitrum, base, mainnet, monad, optimism } from "viem/chains";
import {
  sendTransaction,
  signTypedData,
  switchConnection,
  switchChain as wagmiSwitchChain,
} from "wagmi/actions";
import type { SupportedSKChains } from "@/domain/chains";
import {
  type AccountsState,
  type BrowserWalletAccount,
  makeBrowserWalletAccount,
  SignTransactionError,
  SwitchAccountError,
  SwitchChainError,
} from "@/domain/signer";
import {
  EIP712Tx,
  type Transaction,
  TransactionHash,
} from "@/domain/transactions";
import { ConfigService } from "@/services/config";
import { SignerService } from "@/services/wallet/signer";

const hyperLiquidL1 = defineChain({
  id: 1337,
  caipNetworkId: "eip155:1337",
  chainNamespace: "eip155",
  name: "Hyperliquid L1",
  nativeCurrency: { name: "HYPE", symbol: "HYPE", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://api.hyperliquid.xyz/evm"] },
  },
  blockExplorers: {
    default: { name: "Hyperliquid", url: "https://app.hyperliquid.xyz" },
  },
});

export const BrowserSignerLayer = Effect.gen(function* () {
  const projectId = yield* ConfigService.pipe(
    Effect.andThen((config) => config.reownProjectId),
  );

  const networks: NonEmptyArray<
    AppKitNetwork & { skChainName: SupportedSKChains }
  > = [
    { ...mainnet, skChainName: EvmNetworks.Ethereum },
    { ...base, skChainName: EvmNetworks.Base },
    { ...arbitrum, skChainName: EvmNetworks.Arbitrum },
    { ...optimism, skChainName: EvmNetworks.Optimism },
    { ...monad, skChainName: EvmNetworks.Monad },
    { ...hyperLiquidL1, skChainName: EvmNetworks.HyperEVM },
  ];

  const chainsMap = Record.fromIterableBy(networks, (network) =>
    network.id.toString(),
  );

  const wagmiAdapter = new WagmiAdapter({
    networks,
    projectId,
    multiInjectedProviderDiscovery: true,
  });

  createAppKit({
    networks,
    projectId,
    themeVariables: {
      "--apkt-font-family": "var(--font-family)",
    },
    enableNetworkSwitch: false,
    adapters: [wagmiAdapter],
  });

  const switchChain = (chainId: AppKitNetwork["id"]) =>
    Effect.gen(function* () {
      const chain = yield* Record.get(chainsMap, chainId.toString()).pipe(
        Effect.mapError(() => new ChainNotFoundError()),
      );

      yield* Effect.tryPromise({
        try: () =>
          wagmiSwitchChain(wagmiAdapter.wagmiConfig, {
            chainId: typeof chain.id === "number" ? chain.id : Number(chain.id),
          }),
        catch: (e) => new SwitchChainError({ cause: e }),
      });
    });

  const signTransaction = Effect.fn(function* ({
    transaction,
  }: {
    transaction: Transaction;
  }) {
    const chainId = Schema.is(EIP712Tx)(transaction)
      ? transaction.domain.chainId
      : transaction.chainId;

    if (chainId !== wagmiAdapter.wagmiConfig.state.chainId) {
      yield* switchChain(chainId).pipe(Effect.orDie);
    }

    return yield* Effect.tryPromise({
      try: () =>
        Schema.is(EIP712Tx)(transaction)
          ? signTypedData(wagmiAdapter.wagmiConfig, {
              primaryType: transaction.primaryType,
              message: transaction.message,
              types: transaction.types,
              domain: transaction.domain,
            })
          : sendTransaction(wagmiAdapter.wagmiConfig, transaction),
      catch: (e) => new SignTransactionError({ cause: e }),
    }).pipe(Effect.andThen(Schema.decodeSync(TransactionHash)));
  });

  const accountsStateRef = yield* SubscriptionRef.make<
    AccountsState<BrowserWalletAccount>
  >({
    status: "disconnected",
  });

  yield* Effect.acquireRelease(
    Effect.sync(() =>
      wagmiAdapter.wagmiConfig.subscribe(identity, (nextState) => {
        nextState.status;
        const currentConnectionId = nextState.current;

        SubscriptionRef.update(
          accountsStateRef,
          (prevWallet): AccountsState<BrowserWalletAccount> => {
            const connection = Option.fromNullable(currentConnectionId).pipe(
              Option.flatMapNullable((connectionId) =>
                nextState.connections.get(connectionId),
              ),
            );

            if (Option.isNone(connection)) {
              return { status: "disconnected" };
            }

            const currentAccount = Option.some(prevWallet).pipe(
              Option.filter((accounts) => accounts?.status === "connected"),
              Option.map((wallet) => wallet.currentAccount),
              Option.flatMapNullable((prevAcc) =>
                connection.value.accounts.find(
                  (acc) => acc === prevAcc.address,
                ),
              ),
              Option.orElse(() => _Array.head(connection.value.accounts)),
            );

            if (Option.isNone(currentAccount)) {
              return { status: "disconnected" };
            }

            return {
              status: "connected",
              currentAccount: makeBrowserWalletAccount({
                address: currentAccount.value,
              }),
              accounts: connection.value.accounts.map((acc) =>
                makeBrowserWalletAccount({
                  address: acc,
                }),
              ),
            };
          },
        ).pipe(Effect.runSync);
      }),
    ),
    (unsubscribe) => Effect.sync(() => unsubscribe()),
  );

  const switchAccount = Effect.fn(
    function* ({ account }: { account: BrowserWalletAccount }) {
      const connection = yield* Option.fromNullable(
        wagmiAdapter.wagmiConfig.state.connections.get(account.address),
      );

      yield* Effect.tryPromise(() =>
        switchConnection(wagmiAdapter.wagmiConfig, {
          connector: connection.connector,
        }),
      );
    },
    Effect.mapError((e) => new SwitchAccountError({ cause: e })),
  );

  return SignerService.of({
    type: "browser",
    signTransaction,
    switchAccount,
    wagmiAdapter,
    accountsStream: accountsStateRef.changes,
    getAccountState: accountsStateRef.get,
  });
}).pipe(Layer.scoped(SignerService));
