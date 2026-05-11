import {
  Array as _Array,
  Context,
  Data,
  Duration,
  Effect,
  Layer,
  Match,
  Schedule,
  Schema,
  Stream,
  SubscriptionRef,
} from "effect";
import type { BrowserSigner, LedgerSigner } from "../../domain/signer";
import { Transaction } from "../../domain/transactions";
import {
  type SignTransactionsState,
  TransactionFailedError,
  TransactionNotConfirmedError,
  type Wallet,
} from "../../domain/wallet";
import { ApiClientService } from "../api-client";
import type { ActionDto } from "../api-client/client-factory";
import { SignerService } from "./signer";

export class WalletService extends Context.Service<WalletService>()(
  "perps/services/wallet-service/WalletService",
  {
    make: Effect.gen(function* () {
      const apiClient = yield* ApiClientService;
      const signer = yield* SignerService;

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
                  error: null,
                  txHash: null,
                  step: "sign" as const,
                }),
                SignStart: () => ({
                  ...state,
                  error: null,
                  txHash: null,
                  step: "sign" as const,
                }),
                SignDone: (val) => ({
                  ...state,
                  error: null,
                  txHash: val.txHash,
                  step: "submit" as const,
                }),
                SubmitStart: () => ({
                  ...state,
                  error: null,
                  txHash: state.txHash as string,
                  step: "submit" as const,
                }),
                SubmitDone: () => ({
                  ...state,
                  error: null,
                  txHash: state.txHash as string,
                  step: "check" as const,
                }),
                CheckStart: () => ({
                  ...state,
                  error: null,
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
            const tx = yield* Effect.fromOption(
              _Array.get(state.transactions, state.currentTxIndex),
            ).pipe(Effect.orDie);

            const accountState = yield* signer.getAccountState;

            if (accountState.status === "disconnected") {
              return yield* Effect.die(new Error("Wallet is disconnected"));
            }

            const signablePayload = tx.signablePayload;

            if (!signablePayload) {
              return yield* updateState(
                SignAction.CheckDone({ action: state.action }),
              );
            }

            const decodedTx = yield* Schema.decodeUnknownEffect(Transaction)(
              signablePayload,
            ).pipe(Effect.orDie);

            yield* Match.value(state.step).pipe(
              Match.when(null, () => updateState(SignAction.MachineStart())),
              Match.when(
                "sign",
                Effect.fn(function* () {
                  yield* updateState(SignAction.SignStart());

                  const txHash = yield* signer.signTransaction({
                    transaction: decodedTx,
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
                    Effect.filterOrFail(
                      (txHash): txHash is string => txHash !== null,
                      () => new TransactionFailedError(),
                    ),
                  );

                  yield* apiClient.TransactionsControllerSubmitTransaction(
                    tx.id,
                    {
                      payload:
                        tx.signingFormat === "EIP712_TYPED_DATA"
                          ? { signedPayload: txHash }
                          : { transactionHash: txHash },
                    },
                  );

                  yield* updateState(SignAction.SubmitDone());
                }),
              ),
              Match.when(
                "check",
                Effect.fn(function* () {
                  yield* updateState(SignAction.CheckStart());

                  const action = yield* apiClient
                    .ActionsControllerGetAction(state.action.id, undefined)
                    .pipe(
                      Effect.andThen((res) =>
                        Effect.fromOption(
                          _Array.findFirst(
                            res.transactions,
                            (newTx) => newTx.id === tx.id,
                          ),
                        ).pipe(
                          Effect.catch(() =>
                            Effect.die(
                              new Error("Transaction not found in response"),
                            ),
                          ),
                          Effect.andThen((newTx) =>
                            Match.value(newTx.status).pipe(
                              Match.when(
                                (res) =>
                                  res === "CONFIRMED" || res === "BROADCASTED",
                                () => Effect.succeed(newTx),
                              ),
                              Match.when(
                                (res) =>
                                  res === "NOT_FOUND" || res === "FAILED",
                                () => Effect.fail(new TransactionFailedError()),
                              ),
                              Match.orElse(() =>
                                Effect.fail(new TransactionNotConfirmedError()),
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

          Effect.runFork(startMachine as Effect.Effect<void, never, never>);

          const retry = startMachine as Effect.Effect<void, never, never>;
          const stream = SubscriptionRef.changes(ref);

          return { stream, retry };
        });

      const getWalletState = Match.type<
        | {
            type: BrowserSigner["type"];
            signer: BrowserSigner;
            accountsState: Effect.Success<BrowserSigner["getAccountState"]>;
          }
        | {
            type: LedgerSigner["type"];
            signer: LedgerSigner;
            accountsState: Effect.Success<LedgerSigner["getAccountState"]>;
          }
      >().pipe(
        Match.withReturnType<Wallet>(),
        Match.when({ type: "browser" }, ({ signer, accountsState }) =>
          Match.value(accountsState).pipe(
            Match.withReturnType<Wallet>(),
            Match.when({ status: "connected" }, (connectedState) => {
              const state = connectedState as Effect.Success<
                BrowserSigner["getAccountState"]
              > & { status: "connected" };
              return {
                type: "browser",
                wagmiAdapter: signer.wagmiAdapter,
                status: "connected",
                accounts: state.accounts,
                currentAccount: state.currentAccount,
                signTransactions,
                switchAccount: signer.switchAccount,
              };
            }),
            Match.orElse(() => {
              return {
                type: "browser",
                wagmiAdapter: signer.wagmiAdapter,
                status: "disconnected",
              };
            }),
          ),
        ),
        Match.orElse(({ accountsState, signer }) =>
          Match.value(accountsState).pipe(
            Match.withReturnType<Wallet>(),
            Match.when({ status: "connected" }, (connectedState) => {
              const state = connectedState as Effect.Success<
                LedgerSigner["getAccountState"]
              > & { status: "connected" };
              return {
                type: "ledger",
                status: "connected",
                accounts: state.accounts,
                currentAccount: state.currentAccount,
                signTransactions,
                switchAccount: signer.switchAccount,
              };
            }),
            Match.orElse(() => {
              return {
                type: "ledger",
                status: "disconnected",
              };
            }),
          ),
        ),
      );

      const walletStream = Match.value(signer).pipe(
        Match.when({ type: "browser" }, (s) =>
          s.accountsStream.pipe(
            Stream.map((accountsState) =>
              getWalletState({ type: "browser", signer: s, accountsState }),
            ),
          ),
        ),
        Match.when({ type: "ledger" }, (s) =>
          s.accountsStream.pipe(
            Stream.map((accountsState) =>
              getWalletState({ type: "ledger", signer: s, accountsState }),
            ),
          ),
        ),
        Match.exhaustive,
      );

      return { walletStream };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(ApiClientService.layer),
  );
}
