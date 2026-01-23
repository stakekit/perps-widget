import {
  Array as _Array,
  Data,
  Duration,
  Effect,
  Match,
  Schedule,
  Schema,
  Stream,
  SubscriptionRef,
} from "effect";
import { Transaction } from "@/domain/transactions";
import {
  type SignTransactionsState,
  TransactionFailedError,
  TransactionNotConfirmedError,
  type Wallet,
} from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import type { ActionDto } from "@/services/api-client/api-schemas";
import { type AccountsState, Signer } from "@/services/wallet/signer";

export class WalletService extends Effect.Service<WalletService>()(
  "perps/services/wallet-service/WalletService",
  {
    dependencies: [ApiClientService.Default],
    scoped: Effect.gen(function* () {
      const apiClient = yield* ApiClientService;
      const signer = yield* Signer;

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
            const tx = yield* _Array
              .get(state.transactions, state.currentTxIndex)
              .pipe(Effect.orDie);

            const accountState = yield* signer.getAccountState;

            if (accountState.status === "disconnected") {
              return yield* Effect.dieMessage("Wallet is disconnected");
            }

            const signablePayload = tx.signablePayload;

            if (!signablePayload) {
              return yield* updateState(
                SignAction.CheckDone({ action: state.action }),
              );
            }

            const decodedTx = yield* Schema.decodeUnknown(Transaction)(
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
                    account: accountState.currentAccount,
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

          startMachine.pipe(Effect.runFork);

          const retry = startMachine;
          const stream = ref.changes;

          return { stream, retry };
        });

      const getWalletState = Match.type<{
        signer: Signer["Type"];
        accountsState: AccountsState;
      }>().pipe(
        Match.withReturnType<Wallet>(),
        Match.when(
          { signer: { type: "browser" } },
          ({ signer, accountsState }) =>
            Match.value(accountsState).pipe(
              Match.withReturnType<Wallet>(),
              Match.when({ status: "connected" }, (connectedState) => {
                return {
                  type: "browser",
                  wagmiAdapter: signer.wagmiAdapter,
                  status: "connected",
                  accounts: connectedState.accounts,
                  currentAccount: connectedState.currentAccount,
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
        Match.orElse(({ accountsState }) =>
          Match.value(accountsState).pipe(
            Match.withReturnType<Wallet>(),
            Match.when({ status: "connected" }, (connectedState) => {
              return {
                type: "ledger",
                status: "connected",
                accounts: connectedState.accounts,
                currentAccount: connectedState.currentAccount,
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

      const walletStream = signer.accountsStream.pipe(
        Stream.map((accountsState) =>
          getWalletState({ signer, accountsState }),
        ),
      );

      return { walletStream };
    }),
  },
) {}
