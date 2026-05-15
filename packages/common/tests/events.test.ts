import { Effect, Layer, Stream } from "effect";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import { describe, expect, test } from "vitest";
import { portfolioReactivityKeysArray } from "../src/atoms/reactivity-keys";
import type { LifecycleEvent } from "../src/domain";
import { EventsService } from "../src/services/events";

const event = {
  type: "transaction.submitted",
  action: {
    id: "action-1",
    providerId: "hyperliquid",
    action: "open",
    status: "PROCESSING",
  },
  transaction: {
    id: "tx-1",
    type: "OPEN_POSITION",
    status: "BROADCASTED",
    network: "arbitrum",
    chainId: "42161",
  },
  result: {
    type: "transactionHash",
    transactionHash: "0xhash",
  },
} as unknown as LifecycleEvent;

const makeLayer = (invalidations: unknown[]) =>
  EventsService.layer.pipe(
    Layer.provide(
      Layer.succeed(Reactivity.Reactivity, {
        invalidateUnsafe: () => undefined,
        registerUnsafe: () => () => undefined,
        invalidate: (keys) =>
          Effect.sync(() => {
            invalidations.push(keys);
          }),
        mutation: (_keys, effect) => effect,
        query: () => Effect.die(new Error("unused")),
        stream: () => Stream.die(new Error("unused")),
        withBatch: (effect) => effect,
      }),
    ),
  );

describe("EventsService", () => {
  test("delivers external subscriptions and cleans up unsubscribe", () => {
    const invalidations: unknown[] = [];
    const received: LifecycleEvent[] = [];

    return Effect.gen(function* () {
      const events = yield* EventsService;
      const unsubscribe = yield* events.subscribe((event) => {
        received.push(event);
      });

      yield* events.publish(event);
      yield* Effect.yieldNow;
      unsubscribe();
      yield* Effect.yieldNow;
      yield* events.publish({
        ...event,
        type: "action.completed",
        action: { ...event.action, status: "SUCCESS" },
      });
      yield* Effect.yieldNow;

      expect(received).toEqual([event]);
    }).pipe(Effect.provide(makeLayer(invalidations)), Effect.runPromise);
  });

  test("invalidates portfolio reactivity for transaction lifecycle events", () => {
    const invalidations: unknown[] = [];

    return Effect.gen(function* () {
      const events = yield* EventsService;

      yield* events.publish(event);
      yield* Effect.yieldNow;

      expect(invalidations).toContainEqual(portfolioReactivityKeysArray);
    }).pipe(Effect.provide(makeLayer(invalidations)), Effect.runPromise);
  });
});
