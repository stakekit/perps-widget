import {
  type AppKitNetwork,
  arbitrum,
  base,
  defineChain,
  mainnet,
  monad,
  optimism,
} from "@reown/appkit/networks";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { EvmNetworks } from "@stakekit/common";
import {
  Array as _Array,
  Data,
  Duration,
  Effect,
  identity,
  Match,
  Option,
  Record,
  Schedule,
  Schema,
  SubscriptionRef,
} from "effect";
import {
  sendTransaction,
  signTypedData,
  switchChain as wagmiSwitchChain,
} from "wagmi/actions";
import { EIP712TxSchema, TransactionSchema } from "@/domain/transactions";
import {
  ChainNotFoundError,
  isWalletConnected,
  SignTransactionError,
  type SignTransactionsState,
  SwitchChainError,
  TransactionFailedError,
  TransactionNotConfirmedError,
  type Wallet,
} from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import type { ActionDto } from "@/services/api-client/api-schemas";
import { ConfigService } from "@/services/config";
import { LedgerConnectorService } from "@/services/ledger-connector";

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

export class WalletService extends Effect.Service<WalletService>()(
  "perps/services/wallet-service/WalletService",
  {
    dependencies: [LedgerConnectorService.Default],
    scoped: Effect.gen(function* () {
      const { reownProjectId } = yield* ConfigService;
      // const ledgerConnector = yield* LedgerConnectorService;
      const apiClient = yield* ApiClientService;

      const networks: Wallet["networks"] = [
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
        projectId: reownProjectId,
        multiInjectedProviderDiscovery: true,
      });

      const walletRef = yield* SubscriptionRef.make<Wallet>({
        networks,
        wagmiAdapter,
        status: "disconnected",
      });

      type SignAction = Data.TaggedEnum<{
        MachineStart: {};
        SignStart: {};
        SignDone: { txHash: string };
        SubmitStart: {};
        SubmitDone: {};
        CheckStart: {};
        CheckDone: { action: ActionDto };
        Error: {
          error: SignTransactionsState["error"];
        };
      }>;
      const SignAction = Data.taggedEnum<SignAction>();

      const switchChain = (chainId: AppKitNetwork["id"]) =>
        Effect.gen(function* () {
          const chain = yield* Record.get(chainsMap, chainId.toString()).pipe(
            Effect.mapError(() => new ChainNotFoundError()),
          );

          yield* Effect.tryPromise({
            try: () =>
              wagmiSwitchChain(wagmiAdapter.wagmiConfig, {
                chainId:
                  typeof chain.id === "number" ? chain.id : Number(chain.id),
              }),
            catch: (e) => new SwitchChainError({ cause: e }),
          });
        });

      const signTransactions = (action: ActionDto) =>
        Effect.gen(function* () {
          const ref = yield* SubscriptionRef.make<SignTransactionsState>({
            action: action,
            transactions: action.transactions,
            currentTxIndex: 0,
            step: null,
            error: null,
            txHash: null,
            isDone: false,
          });

          const updateState = (action: SignAction) =>
            SubscriptionRef.update(ref, (state) =>
              SignAction.$match(action, {
                MachineStart: () => ({
                  ...state,
                  txHash: null,
                  step: "sign" as const,
                }),
                SignStart: () => ({
                  ...state,
                  txHash: null,
                  step: "sign" as const,
                }),
                SignDone: (val) => ({
                  ...state,
                  txHash: val.txHash,
                  step: "submit" as const,
                }),
                SubmitStart: () => ({
                  ...state,
                  txHash: state.txHash as string,
                  step: "submit" as const,
                }),
                SubmitDone: () => ({
                  ...state,
                  txHash: state.txHash as string,
                  step: "check" as const,
                }),
                CheckStart: () => ({
                  ...state,
                  txHash: state.txHash as string,
                  step: "check" as const,
                }),
                CheckDone: (val) => {
                  const isDone =
                    state.currentTxIndex === state.transactions.length - 1;

                  /**
                   * Mantain order
                   */
                  const transactions = state.transactions.map(
                    (tx) =>
                      val.action.transactions.find((t) => t.id === tx.id) ?? tx,
                  );

                  if (isDone) {
                    return {
                      ...state,
                      isDone,
                      transactions,
                      error: null,
                      step: null,
                      txHash: null,
                    };
                  }

                  return {
                    ...state,
                    txHash: null,
                    transactions,
                    step: "sign" as const,
                    currentTxIndex: state.currentTxIndex + 1,
                  };
                },
                Error: (val) => ({ ...state, error: val.error }),
              }),
            );

          const startMachine = Effect.gen(function* () {
            const state = yield* SubscriptionRef.get(ref);
            const tx = yield* _Array
              .get(state.transactions, state.currentTxIndex)
              .pipe(Effect.orDie);

            const wallet = yield* SubscriptionRef.get(walletRef);

            if (wallet.status === "disconnected") {
              return yield* Effect.dieMessage("Wallet is disconnected");
            }

            const signablePayload = tx.signablePayload;

            if (!signablePayload) {
              return yield* updateState(
                SignAction.CheckDone({ action: state.action }),
              );
            }

            const decodedTx = yield* Schema.decodeUnknown(TransactionSchema)(
              signablePayload,
            ).pipe(Effect.orDie);

            const txChainId = Schema.is(EIP712TxSchema)(decodedTx)
              ? decodedTx.domain.chainId
              : decodedTx.chainId;

            if (txChainId !== wagmiAdapter.wagmiConfig.state.chainId) {
              yield* switchChain(txChainId).pipe(Effect.orDie);
            }

            yield* Match.value(state.step).pipe(
              Match.when(null, () => updateState(SignAction.MachineStart())),
              Match.when(
                "sign",
                Effect.fn(function* () {
                  yield* updateState(SignAction.SignStart());

                  const txHash = yield* Effect.tryPromise({
                    try: () =>
                      Schema.is(EIP712TxSchema)(decodedTx)
                        ? signTypedData(wagmiAdapter.wagmiConfig, {
                            primaryType: decodedTx.primaryType,
                            message: decodedTx.message,
                            types: decodedTx.types,
                            domain: decodedTx.domain,
                          })
                        : sendTransaction(wagmiAdapter.wagmiConfig, decodedTx),
                    catch: (e) => new SignTransactionError({ cause: e }),
                  });

                  yield* updateState(SignAction.SignDone({ txHash }));
                }),
              ),
              Match.when(
                "submit",
                Effect.fn(function* () {
                  yield* updateState(SignAction.SubmitStart());

                  const txHash = yield* SubscriptionRef.get(ref).pipe(
                    Effect.map((state) => state.txHash),
                    Effect.filterOrDieMessage(
                      (txHash) => txHash !== null,
                      "Tx hash is null",
                    ),
                  );

                  yield* apiClient.TransactionsControllerSubmitTransaction(
                    tx.id,
                    tx.signingFormat === "EIP712_TYPED_DATA"
                      ? { signedPayload: txHash }
                      : { transactionHash: txHash },
                  );

                  yield* updateState(SignAction.SubmitDone());
                }),
              ),
              Match.when(
                "check",
                Effect.fn(function* () {
                  yield* updateState(SignAction.CheckStart());

                  const action = yield* apiClient
                    .ActionsControllerGetAction(state.action.id)
                    .pipe(
                      Effect.andThen((res) =>
                        _Array
                          .findFirst(
                            res.transactions,
                            (newTx) => newTx.id === tx.id,
                          )
                          .pipe(
                            Effect.catchAll(() =>
                              Effect.dieMessage(
                                "Transaction not found in response",
                              ),
                            ),
                            Effect.andThen((newTx) =>
                              Match.value(newTx.status).pipe(
                                Match.when(
                                  (res) =>
                                    res === "CONFIRMED" ||
                                    res === "BROADCASTED",
                                  () => Effect.succeed(newTx),
                                ),
                                Match.when(
                                  (res) =>
                                    res === "NOT_FOUND" || res === "FAILED",
                                  () =>
                                    Effect.fail(new TransactionFailedError()),
                                ),
                                Match.orElse(() =>
                                  Effect.fail(
                                    new TransactionNotConfirmedError(),
                                  ),
                                ),
                              ),
                            ),
                            Effect.as(res),
                          ),
                      ),
                      Effect.retry({
                        while: (e) => e._tag === "TransactionNotConfirmedError",
                        times: 20,
                        schedule: Schedule.spaced(Duration.seconds(2)),
                      }),
                    );

                  yield* updateState(SignAction.CheckDone({ action }));
                }),
              ),
              Match.exhaustive,
            );
          }).pipe(
            Effect.tapError((e) => updateState(SignAction.Error({ error: e }))),
            Effect.repeat({
              while: () =>
                SubscriptionRef.get(ref).pipe(
                  Effect.map((state) => state.step !== null),
                ),
            }),
            Effect.ignore,
          );

          return {
            stream: ref.changes,
            startMachine,
            state: yield* SubscriptionRef.get(ref),
          };
        });

      yield* Effect.acquireRelease(
        Effect.sync(() =>
          wagmiAdapter.wagmiConfig.subscribe(identity, (nextState) => {
            nextState.status;
            const currentConnectionId = nextState.current;

            SubscriptionRef.update(walletRef, (prevWallet): Wallet => {
              const connection = Option.fromNullable(currentConnectionId).pipe(
                Option.flatMapNullable((connectionId) =>
                  nextState.connections.get(connectionId),
                ),
              );

              if (Option.isNone(connection)) {
                return {
                  status: "disconnected",
                  wagmiAdapter,
                  networks,
                };
              }

              const currentAccount = Option.some(prevWallet).pipe(
                Option.filter(isWalletConnected),
                Option.map((wallet) => wallet.currentAccount),
                Option.flatMapNullable((prevAcc) =>
                  connection.value.accounts.find(
                    (acc) => acc === prevAcc.address,
                  ),
                ),
                Option.orElse(() => _Array.head(connection.value.accounts)),
              );

              if (Option.isNone(currentAccount)) {
                return {
                  status: "disconnected",
                  wagmiAdapter,
                  networks,
                };
              }

              return {
                status: "connected",
                wagmiAdapter,
                networks,
                accounts: connection.value.accounts.map((acc) => ({
                  id: acc,
                  address: acc,
                })),
                currentAccount: {
                  id: currentAccount.value,
                  address: currentAccount.value,
                },
                signTransactions,
              };
            }).pipe(Effect.runSync);
          }),
        ),
        (unsubscribe) => Effect.sync(() => unsubscribe()),
      );

      createAppKit({
        networks,
        projectId: reownProjectId,
        themeVariables: {
          "--apkt-font-family": "var(--font-family)",
        },
        enableNetworkSwitch: false,
        adapters: [wagmiAdapter],
      });

      return { walletStream: walletRef.changes };
    }),
  },
) {}
