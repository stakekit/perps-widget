import {
  Array as _Array,
  Cause,
  Duration,
  Effect,
  Match,
  Option,
  Ref,
  Schedule,
  Schema,
  Stream,
} from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import {
  Action,
  makeLifecycleActionContext,
  makeLifecycleTransactionContext,
} from "../domain";
import { EIP712Tx, Transaction } from "../domain/transactions";
import {
  type SignTransactionsState,
  TransactionFailedError,
  TransactionNotConfirmedError,
} from "../domain/wallet";
import { ApiClientService } from "../services/api-client";
import { EventsService } from "../services/events";
import { runtimeAtom } from "../services/runtime";
import { WalletAdapterService } from "../services/wallet-adapter";

const makeInitialState = (action: Action): SignTransactionsState => ({
  action,
  transactions: action.transactions,
  currentTxIndex: 0,
  step: null,
  error: null,
  txHash: null,
  isDone: false,
});

const advanceToNextTransaction = (
  state: SignTransactionsState,
  updatedAction: Action,
): SignTransactionsState => {
  const isDone =
    updatedAction.status === "SUCCESS" ||
    state.currentTxIndex === state.transactions.length - 1;

  const transactions = _Array.map(state.transactions, (tx) =>
    _Array
      .findFirst(updatedAction.transactions, (newTx) => newTx.id === tx.id)
      .pipe(Option.getOrElse(() => tx)),
  );

  if (isDone) {
    return {
      ...state,
      action: updatedAction,
      isDone: true,
      transactions,
      error: null,
      step: null,
      txHash: null,
    };
  }

  return {
    ...state,
    action: updatedAction,
    currentTxIndex: state.currentTxIndex + 1,
    transactions,
    isDone: false,
    error: null,
    step: "sign" as const,
    txHash: null,
  };
};

export const makeTransactionExecution = (action: Action) =>
  Effect.gen(function* () {
    const apiClient = yield* ApiClientService;
    const events = yield* EventsService;
    const walletAdapter = yield* WalletAdapterService;
    const stateRef = yield* Ref.make(makeInitialState(action));

    return Effect.gen(function* () {
      const state = yield* Ref.get(stateRef);
      const tx = yield* Effect.fromOption(
        _Array.get(state.transactions, state.currentTxIndex),
      ).pipe(Effect.orDie);

      const walletState = walletAdapter.getState();

      if (walletState.status === "disconnected") {
        return yield* Effect.die(new Error("Wallet is disconnected"));
      }

      if (!tx.signablePayload) {
        const result = advanceToNextTransaction(state, state.action);

        yield* Ref.set(stateRef, result);

        if (result.isDone) {
          yield* events.publish({
            type: "action.completed",
            action: makeLifecycleActionContext(result.action),
          });
        }

        return result;
      }

      const result: SignTransactionsState = yield* Match.value(state.step).pipe(
        Match.when(null, () =>
          Effect.succeed({
            ...state,
            error: null,
            step: "sign" as const,
            txHash: null,
          }),
        ),
        Match.when("sign", () =>
          Effect.gen(function* () {
            yield* events.publish({
              type: "transaction.signing_started",
              action: makeLifecycleActionContext(state.action),
              transaction: makeLifecycleTransactionContext(tx),
            });

            const decodedTx = yield* Schema.decodeUnknownEffect(Transaction)(
              tx.signablePayload,
            ).pipe(Effect.orDie);

            const signPayload = Schema.is(EIP712Tx)(decodedTx)
              ? walletAdapter.signTypedData({
                  account: walletState.currentAccount.address,
                  transaction: decodedTx,
                })
              : walletAdapter.sendTransaction({
                  account: walletState.currentAccount.address,
                  transaction: decodedTx,
                });

            const payload = yield* signPayload;

            yield* events.publish({
              type: "transaction.submitted",
              action: makeLifecycleActionContext(state.action),
              transaction: makeLifecycleTransactionContext(tx),
              result:
                tx.signingFormat === "EIP712_TYPED_DATA"
                  ? { type: "signedPayload", signedPayload: payload }
                  : { type: "transactionHash", transactionHash: payload },
            });

            return {
              ...state,
              error: null,
              step: "submit" as const,
              txHash: payload,
            };
          }),
        ),
        Match.when("submit", () => {
          const payload = state.txHash;

          if (!payload) {
            return Effect.fail(new TransactionFailedError());
          }

          return apiClient
            .TransactionsControllerSubmitTransaction(tx.id, {
              payload:
                tx.signingFormat === "EIP712_TYPED_DATA"
                  ? { signedPayload: payload }
                  : { transactionHash: payload },
            })
            .pipe(
              Effect.map(() => ({
                ...state,
                error: null,
                step: "check" as const,
                txHash: payload,
              })),
            );
        }),
        Match.when("check", () =>
          Effect.gen(function* () {
            const updatedAction = yield* apiClient
              .ActionsControllerGetAction(state.action.id, undefined)
              .pipe(
                Effect.andThen((res) =>
                  Schema.decodeUnknownEffect(Action)(res),
                ),
                Effect.andThen((res) =>
                  res.status === "SUCCESS"
                    ? Effect.succeed(res)
                    : Effect.fromOption(
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
                              (status) =>
                                status === "CONFIRMED" ||
                                status === "BROADCASTED",
                              () => Effect.void,
                            ),
                            Match.when(
                              (status) =>
                                status === "NOT_FOUND" || status === "FAILED",
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
                  while: (error) =>
                    error._tag === "TransactionNotConfirmedError",
                  times: 20,
                  schedule: Schedule.spaced(Duration.seconds(2)),
                }),
              );

            return advanceToNextTransaction(state, updatedAction);
          }),
        ),
        Match.exhaustive,
      );

      yield* Ref.set(stateRef, result);

      if (result.isDone) {
        yield* events.publish({
          type: "action.completed",
          action: makeLifecycleActionContext(result.action),
        });
      }

      return result;
    }).pipe(
      Effect.catch((error) =>
        Effect.gen(function* () {
          const failedState = yield* Ref.updateAndGet(stateRef, (state) => ({
            ...state,
            error,
          }));

          yield* events.publish({
            type: "action.failed",
            action: makeLifecycleActionContext(failedState.action),
            error: Cause.pretty(Cause.fail(error)),
          });

          return failedState;
        }),
      ),
    );
  });

export const transactionExecutionAtoms = Atom.family((action: Action) => {
  const machineAtom = runtimeAtom.atom(makeTransactionExecution(action));

  const machineStreamAtom = runtimeAtom.atom((ctx) =>
    ctx.result(machineAtom).pipe(
      Effect.flatten,
      Stream.fromEffect,
      Stream.repeat(Schedule.forever),
      Stream.takeUntil((state) => state.isDone),
    ),
  );

  return {
    machineStreamAtom,
  };
});
