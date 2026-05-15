import { Effect, Layer, Schedule, Schema, Stream } from "effect";
import { describe, expect, test } from "vitest";
import {
  Action,
  type LifecycleEvent,
  type PerpsWalletAdapter,
  SignedPayload,
  type SignTransactionsState,
  TransactionFailedError,
  TransactionHash,
  WalletAddress,
  WalletSendTransactionError,
} from "../src/domain";
import type { ApiClientService } from "../src/services/api-client";
import { ApiClientService as ApiClientTag } from "../src/services/api-client";
import { EventsService } from "../src/services/events";
import { WalletAdapterService } from "../src/services/wallet-adapter";

const account = Schema.decodeUnknownSync(WalletAddress)(
  "0x00000000000000000000000000000000000000a1",
);

const baseTx = {
  id: "tx-1",
  network: "arbitrum" as const,
  chainId: "42161",
  type: "OPEN_POSITION" as const,
  status: "CREATED" as const,
  address: account,
  explorerUrls: [],
};

const makeAction = (tx: Record<string, unknown>, status = "CREATED") =>
  Schema.decodeUnknownSync(Action)({
    id: "action-1",
    providerId: "hyperliquid",
    action: "open",
    status,
    summary: null,
    transactions: [tx],
    createdAt: "2026-05-11T00:00:00.000Z",
    completedAt: "2026-05-11T00:00:00.000Z",
  });

const makeConfirmedAction = () =>
  makeAction({ ...baseTx, status: "CONFIRMED" }, "SUCCESS");

const makeFailedAction = () =>
  makeAction({ ...baseTx, status: "FAILED" }, "PROCESSING");

const evmPayload = {
  from: account,
  to: "0x00000000000000000000000000000000000000b2",
  data: "0x",
  gasLimit: 1n,
  chainId: 42161,
};

const typedDataPayload = {
  domain: { chainId: 42161 },
  types: {},
  message: {},
  primaryType: "Order",
};

const makeWalletAdapter = (options?: {
  sendTransaction?: PerpsWalletAdapter["sendTransaction"];
  signTypedData?: PerpsWalletAdapter["signTypedData"];
}): PerpsWalletAdapter => ({
  mode: "external",
  getState: () => ({
    status: "connected",
    currentAccount: { address: account },
    accounts: [{ address: account }],
  }),
  changes: Stream.empty,
  sendTransaction:
    options?.sendTransaction ??
    (() => Effect.succeed(Schema.decodeUnknownSync(TransactionHash)("0xevm"))),
  signTypedData:
    options?.signTypedData ??
    (() => Effect.succeed(Schema.decodeUnknownSync(SignedPayload)("0xsigned"))),
  switchAccount: () => Effect.void,
  switchChain: () => Effect.void,
});

const makeApiClient = (options?: {
  onSubmit?: (payload: unknown) => void;
  getAction?: () => Effect.Effect<unknown>;
}): ApiClientService["Service"] =>
  ({
    TransactionsControllerSubmitTransaction: (_id: string, payload: unknown) =>
      Effect.sync(() => {
        options?.onSubmit?.(payload);

        return {
          link: "https://example.test",
          status: "CONFIRMED",
        };
      }),
    ActionsControllerGetAction:
      options?.getAction ??
      (() => Effect.succeed(makeConfirmedAction() as unknown)),
  }) as unknown as ApiClientService["Service"];

const collectExecutionStates = (
  execution: Effect.Effect<SignTransactionsState>,
): Effect.Effect<ReadonlyArray<SignTransactionsState>> =>
  execution.pipe(
    Stream.fromEffect,
    Stream.repeat(Schedule.forever),
    Stream.takeUntil((state) => state.isDone || state.error !== null),
    Stream.runCollect,
    Effect.map((states) => Array.from(states)),
  );

const runExecution = (
  action: Action,
  options?: {
    apiClient?: ApiClientService["Service"];
    events?: LifecycleEvent[];
    walletAdapter?: PerpsWalletAdapter;
  },
) =>
  Effect.gen(function* () {
    const { makeTransactionExecution } = yield* Effect.promise(
      () => import("../src/atoms/transaction-execution-atoms"),
    );
    const execution = yield* makeTransactionExecution(action);

    const states = yield* collectExecutionStates(execution);

    return { execution, states };
  }).pipe(
    Effect.provide(
      Layer.mergeAll(
        Layer.succeed(ApiClientTag, options?.apiClient ?? makeApiClient()),
        Layer.succeed(
          WalletAdapterService,
          options?.walletAdapter ?? makeWalletAdapter(),
        ),
        Layer.succeed(EventsService, {
          publish: (event) =>
            Effect.sync(() => {
              options?.events?.push(event);
              return true;
            }),
          publishAll: (events) =>
            Effect.sync(() => {
              options?.events?.push(...events);
              return true;
            }),
          stream: Stream.empty,
          subscribe: () => Effect.succeed(() => undefined),
        }),
      ),
    ),
  );

describe("transaction execution", () => {
  test("completes transactions with no signable payload", () =>
    runExecution(makeAction(baseTx)).pipe(
      Effect.tap(({ states }) =>
        Effect.sync(() => {
          expect(states.at(-1)).toMatchObject({ isDone: true, error: null });
        }),
      ),
      Effect.runPromise,
    ));

  test("submits EVM wallet results as transaction hashes", () => {
    const events: LifecycleEvent[] = [];
    const submitted: unknown[] = [];
    const action = makeAction({
      ...baseTx,
      signingFormat: "EVM_TRANSACTION",
      signablePayload: evmPayload,
    });

    return runExecution(action, {
      apiClient: makeApiClient({
        onSubmit: (payload) => submitted.push(payload),
      }),
      events,
    }).pipe(
      Effect.tap(({ states }) =>
        Effect.sync(() => {
          expect(states.at(-1)).toMatchObject({ isDone: true, error: null });
          expect(submitted.at(-1)).toEqual({
            payload: { transactionHash: "0xevm" },
          });
          expect(events.map((event) => event.type)).toEqual([
            "transaction.signing_started",
            "transaction.submitted",
            "action.completed",
          ]);
        }),
      ),
      Effect.runPromise,
    );
  });

  test("submits EIP-712 wallet results as signed payloads", () => {
    const submitted: unknown[] = [];
    const action = makeAction({
      ...baseTx,
      signingFormat: "EIP712_TYPED_DATA",
      signablePayload: typedDataPayload,
    });

    return runExecution(action, {
      apiClient: makeApiClient({
        onSubmit: (payload) => submitted.push(payload),
      }),
    }).pipe(
      Effect.tap(({ states }) =>
        Effect.sync(() => {
          expect(states.at(-1)).toMatchObject({ isDone: true, error: null });
          expect(submitted.at(-1)).toEqual({
            payload: { signedPayload: "0xsigned" },
          });
        }),
      ),
      Effect.runPromise,
    );
  });

  test("stops in a terminal failure state", () => {
    const action = makeAction({
      ...baseTx,
      signingFormat: "EVM_TRANSACTION",
      signablePayload: evmPayload,
    });

    return runExecution(action, {
      apiClient: makeApiClient({
        getAction: () => Effect.succeed(makeFailedAction() as unknown),
      }),
    }).pipe(
      Effect.tap(({ states }) =>
        Effect.sync(() => {
          const state = states.at(-1);

          expect(state?.error).toBeInstanceOf(TransactionFailedError);
          expect(state?.isDone).toBe(false);
        }),
      ),
      Effect.runPromise,
    );
  });

  test("retries after a recoverable signing error", () => {
    const action = makeAction({
      ...baseTx,
      signingFormat: "EVM_TRANSACTION",
      signablePayload: evmPayload,
    });
    let attempts = 0;

    return Effect.gen(function* () {
      const { execution, states } = yield* runExecution(action, {
        walletAdapter: makeWalletAdapter({
          sendTransaction: () => {
            attempts += 1;

            if (attempts === 1) {
              return Effect.fail(
                new WalletSendTransactionError({
                  reason: new Error("temporary signing failure"),
                }),
              );
            }

            return Effect.succeed(
              Schema.decodeUnknownSync(TransactionHash)("0xretry"),
            );
          },
        }),
      });

      expect(states.at(-1)?.error).not.toBeNull();

      const retryStates = yield* collectExecutionStates(execution);

      expect(retryStates.at(-1)).toMatchObject({
        isDone: true,
        error: null,
      });
    }).pipe(Effect.runPromise);
  });
});
