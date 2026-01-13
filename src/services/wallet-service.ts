import type { HttpClientError } from "@effect/platform";
import { EvmNetworks } from "@stakekit/common";
import {
  Array as _Array,
  Data,
  Duration,
  Effect,
  Match,
  Schedule,
  SubscriptionRef,
} from "effect";
import type { ParseError } from "effect/ParseResult";
import type {
  DeserializeTransactionError,
  SignTransactionError,
  Wallet,
  WalletAccount,
} from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import type {
  ActionDto,
  TransactionDto,
} from "@/services/api-client/api-schemas";
import type { SKClientError } from "@/services/api-client/client-factory";
import { ConfigService } from "@/services/config";
import { LedgerConnectorService } from "@/services/ledger-connector";

export class WalletService extends Effect.Service<WalletService>()(
  "perps/services/wallet-service/WalletService",
  {
    dependencies: [LedgerConnectorService.Default],
    effect: Effect.gen(function* () {
      const { forceAddress } = yield* ConfigService;
      const ledgerConnector = yield* LedgerConnectorService;
      const apiClient = yield* ApiClientService;

      const wallet: Wallet = yield* Match.value(ledgerConnector.isEnabled).pipe(
        Match.when(true, () =>
          ledgerConnector.connect.pipe(
            Effect.map((val) => ({
              currentAccount: val.currentAccount,
              accounts: val.accounts,
              signTransaction: ledgerConnector.signTransaction,
            })),
          ),
        ),
        Match.orElse(() =>
          Effect.succeed({
            currentAccount: {
              address: forceAddress,
              chain: EvmNetworks.Ethereum as const,
              id: "",
            },
            accounts: [],
            signTransaction: () => Effect.succeed(""),
          }),
        ),
      );

      type SignAction = Data.TaggedEnum<{
        MachineStart: {};
        SignStart: {};
        SignDone: { txHash: string };
        SubmitStart: {};
        SubmitDone: {};
        CheckStart: {};
        CheckDone: { transaction: TransactionDto };
        Error: {
          error: SignTransactionsState["error"];
        };
      }>;
      const SignAction = Data.taggedEnum<SignAction>();

      const signTransactions = (args: {
        action: ActionDto;
        account: WalletAccount;
      }) =>
        Effect.gen(function* () {
          const ref = yield* SubscriptionRef.make<SignTransactionsState>({
            transactions: args.action.transactions,
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

                  if (isDone) {
                    return {
                      ...state,
                      transactions: state.transactions.map((tx, index) =>
                        index === state.currentTxIndex ? val.transaction : tx,
                      ),
                      error: null,
                      step: null,
                      txHash: null,
                    };
                  }

                  return {
                    ...state,
                    txHash: null,
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

            const signablePayload = tx.signablePayload;

            if (!signablePayload) {
              return yield* updateState(
                SignAction.CheckDone({ transaction: tx }),
              );
            }

            yield* Match.value(state.step).pipe(
              Match.when(null, () => updateState(SignAction.MachineStart())),
              Match.when(
                "sign",
                Effect.fn(function* () {
                  yield* updateState(SignAction.SignStart());

                  const txHash = yield* wallet.signTransaction({
                    account: args.account,
                    tx: signablePayload,
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
                    { signedPayload: txHash },
                  );

                  yield* updateState(SignAction.SubmitDone());
                }),
              ),
              Match.when(
                "check",
                Effect.fn(function* () {
                  yield* updateState(SignAction.CheckStart());

                  const transaction = yield* apiClient
                    .ActionsControllerGetAction(tx.id)
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
                          ),
                      ),
                      Effect.andThen((newTx) =>
                        Match.value(newTx.status).pipe(
                          Match.when("CONFIRMED", () => Effect.succeed(newTx)),
                          Match.when(
                            (res) => res === "NOT_FOUND" || res === "FAILED",
                            () => Effect.fail(new TransactionFailedError()),
                          ),
                          Match.orElse(() =>
                            Effect.fail(new TransactionNotConfirmedError()),
                          ),
                        ),
                      ),
                      Effect.retry({
                        while: (e) => e._tag === "TransactionNotConfirmedError",
                        times: 20,
                        schedule: Schedule.spaced(Duration.seconds(2)),
                      }),
                    );

                  yield* updateState(SignAction.CheckDone({ transaction }));
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
          );

          return {
            stream: ref.changes,
            startMachine,
            state: yield* SubscriptionRef.get(ref),
          };
        });

      return { ...wallet, signTransactions };
    }),
  },
) {}

export class TransactionNotConfirmedError extends Data.TaggedError(
  "TransactionNotConfirmedError",
) {}

export class TransactionFailedError extends Data.TaggedError(
  "TransactionFailedError",
) {}

export type SignTransactionsState = {
  transactions: readonly TransactionDto[];
  currentTxIndex: number;
  error:
    | null
    | HttpClientError.HttpClientError
    | ParseError
    | SKClientError<any, unknown>
    | DeserializeTransactionError
    | SignTransactionError
    | TransactionNotConfirmedError
    | TransactionFailedError;
  isDone: boolean;
} & (
  | {
      step: "sign" | null;
      txHash: null;
    }
  | {
      step: "submit" | "check";
      txHash: string;
    }
);
