import { Context, Effect, Exit, Layer, PubSub, Scope, Stream } from "effect";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import { portfolioReactivityKeysArray } from "../atoms/reactivity-keys";
import type { LifecycleEvent } from "../domain";

const shouldInvalidatePortfolio = (event: LifecycleEvent) =>
  event.type === "transaction.submitted" || event.type === "action.completed";

export class EventsService extends Context.Service<EventsService>()(
  "perps/services/events/EventsService",
  {
    make: Effect.gen(function* () {
      const pubsub = yield* PubSub.unbounded<LifecycleEvent>();
      const reactivity = yield* Reactivity.Reactivity;

      const stream = Stream.fromPubSub(pubsub);

      const publish = (event: LifecycleEvent) => PubSub.publish(pubsub, event);

      const publishAll = (events: ReadonlyArray<LifecycleEvent>) =>
        PubSub.publishAll(pubsub, events);

      const portfolioSubscription = yield* PubSub.subscribe(pubsub);

      yield* PubSub.take(portfolioSubscription).pipe(
        Effect.andThen((event) =>
          shouldInvalidatePortfolio(event)
            ? reactivity.invalidate(portfolioReactivityKeysArray)
            : Effect.void,
        ),
        Effect.forever,
        Effect.forkScoped,
      );

      const subscribe = (listener: (event: LifecycleEvent) => void) =>
        Effect.gen(function* () {
          const scope = yield* Scope.make();
          const subscription = yield* PubSub.subscribe(pubsub).pipe(
            Scope.provide(scope),
          );

          yield* PubSub.take(subscription).pipe(
            Effect.tap((event) => Effect.sync(() => listener(event))),
            Effect.forever,
            Effect.forkIn(scope),
          );

          return () => {
            Effect.runFork(Scope.close(scope, Exit.void));
          };
        });

      return {
        publish,
        publishAll,
        stream,
        subscribe,
      };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(Reactivity.layer),
  );
}
