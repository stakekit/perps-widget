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
  switchConnection,
  sendTransaction as wagmiSendTransaction,
  signTypedData as wagmiSignTypedData,
  switchChain as wagmiSwitchChain,
} from "wagmi/actions";
import {
  type EvmTransactionRequest,
  makeWalletAdapterAccount,
  SignedPayload,
  TransactionHash,
  type TypedDataRequest,
  WalletAdapterState,
  WalletSendTransactionError,
  WalletSignTypedDataError,
  WalletSwitchAccountError,
  WalletSwitchChainError,
} from "../../domain";
import type { SupportedSKChains } from "../../domain/chains";
import { ChainId, type WalletAddress } from "../../domain/ids";
import { ConfigService } from "../config";
import { WalletAdapterService } from "../wallet-adapter";

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

export const BrowserWalletAdapterLayer = Effect.gen(function* () {
  const config = yield* ConfigService;
  const projectId =
    config.reownProjectId ??
    (yield* Effect.die(new Error("Reown project ID has not been provided")));

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

  const switchChain = (chainId: typeof ChainId.Type) =>
    Effect.gen(function* () {
      const chain = yield* Effect.fromOption(
        Record.get(chainsMap, chainId.toString()),
      ).pipe(
        Effect.mapError(
          () =>
            new WalletSwitchChainError({
              reason: new ChainNotFoundError(),
            }),
        ),
      );

      yield* Effect.tryPromise({
        try: () =>
          wagmiSwitchChain(wagmiAdapter.wagmiConfig, {
            chainId: typeof chain.id === "number" ? chain.id : Number(chain.id),
          }),
        catch: (reason) => new WalletSwitchChainError({ reason }),
      });
    });

  const ensureChain = (chainId: AppKitNetwork["id"]) => {
    if (chainId === wagmiAdapter.wagmiConfig.state.chainId) {
      return Effect.void;
    }

    return Schema.decodeUnknownEffect(ChainId)(chainId.toString()).pipe(
      Effect.mapError((reason) => new WalletSwitchChainError({ reason })),
      Effect.andThen(switchChain),
    );
  };

  const sendTransaction = Effect.fn(function* ({
    transaction,
  }: EvmTransactionRequest) {
    yield* ensureChain(transaction.chainId);

    const hash = yield* Effect.tryPromise({
      try: () => wagmiSendTransaction(wagmiAdapter.wagmiConfig, transaction),
      catch: (reason) => new WalletSendTransactionError({ reason }),
    });

    return yield* Schema.decodeUnknownEffect(TransactionHash)(hash).pipe(
      Effect.mapError((reason) => new WalletSendTransactionError({ reason })),
    );
  });

  const signTypedData = Effect.fn(function* ({
    transaction,
  }: TypedDataRequest) {
    yield* ensureChain(transaction.domain.chainId);

    const payload = yield* Effect.tryPromise({
      try: () =>
        wagmiSignTypedData(wagmiAdapter.wagmiConfig, {
          primaryType: transaction.primaryType,
          message: transaction.message,
          types: transaction.types,
          domain: transaction.domain,
        }),
      catch: (reason) => new WalletSignTypedDataError({ reason }),
    });

    return yield* Schema.decodeUnknownEffect(SignedPayload)(payload).pipe(
      Effect.mapError((reason) => new WalletSignTypedDataError({ reason })),
    );
  });

  const stateRef = yield* SubscriptionRef.make<WalletAdapterState>({
    status: "disconnected",
  });

  yield* Effect.acquireRelease(
    Effect.sync(() =>
      wagmiAdapter.wagmiConfig.subscribe(identity, (nextState) => {
        const currentConnectionId = nextState.current;

        SubscriptionRef.update(stateRef, (prevState): WalletAdapterState => {
          const connection = Option.fromNullishOr(currentConnectionId).pipe(
            Option.flatMap((connectionId) =>
              Option.fromNullishOr(nextState.connections.get(connectionId)),
            ),
          );

          if (Option.isNone(connection)) {
            return { status: "disconnected" };
          }

          const currentAccount = Option.some(prevState).pipe(
            Option.filter((accounts) => accounts?.status === "connected"),
            Option.map((wallet) => wallet.currentAccount),
            Option.flatMap((prevAcc) =>
              Option.fromNullishOr(
                connection.value.accounts.find(
                  (account) => account === prevAcc.address,
                ),
              ),
            ),
            Option.orElse(() => _Array.head(connection.value.accounts)),
          );

          if (Option.isNone(currentAccount)) {
            return { status: "disconnected" };
          }

          return Schema.decodeUnknownSync(WalletAdapterState)({
            status: "connected",
            currentAccount: makeWalletAdapterAccount({
              address: currentAccount.value,
            }),
            accounts: connection.value.accounts.map((address) =>
              makeWalletAdapterAccount({ address }),
            ),
          });
        }).pipe(Effect.runSync);
      }),
    ),
    (unsubscribe) => Effect.sync(() => unsubscribe()),
  );

  const switchAccount = Effect.fn(
    function* (address: typeof WalletAddress.Type) {
      const connection = yield* Option.fromNullishOr(
        wagmiAdapter.wagmiConfig.state.connections.get(address),
      );

      yield* Effect.tryPromise(() =>
        switchConnection(wagmiAdapter.wagmiConfig, {
          connector: connection.connector,
        }),
      );
    },
    Effect.mapError((reason) => new WalletSwitchAccountError({ reason })),
  );

  return WalletAdapterService.of({
    mode: "browser",
    wagmiAdapter,
    getState: () => stateRef.value,
    changes: SubscriptionRef.changes(stateRef),
    sendTransaction,
    signTypedData,
    switchAccount,
    switchChain,
  });
}).pipe(Layer.effect(WalletAdapterService));
