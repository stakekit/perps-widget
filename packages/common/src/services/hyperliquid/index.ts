import type { AllMidsWsEvent, CandleWsEvent } from "@nktkas/hyperliquid";
import {
  HttpTransport,
  InfoClient,
  SubscriptionClient,
  WebSocketTransport,
} from "@nktkas/hyperliquid";
import { Context, Effect, Layer, Queue, Schema, Stream } from "effect";

export class HyperliquidService extends Context.Service<HyperliquidService>()(
  "perps/services/hyperliquid/HyperliquidService",
  {
    make: Effect.gen(function* () {
      const transport = new WebSocketTransport();
      const client = new SubscriptionClient({ transport });

      const httpTransport = new HttpTransport();
      const infoClient = new InfoClient({ transport: httpTransport });

      yield* Effect.addFinalizer(() => Effect.promise(() => transport.close()));

      const candleSnapshot = (params: {
        coin: typeof CoinSchema.Type;
        interval: typeof CandleIntervalSchema.Type;
        startTime: number;
        endTime?: number;
      }) =>
        Effect.tryPromise(() => infoClient.candleSnapshot(params)).pipe(
          Effect.mapError((reason) => new GetCandleSnapshotError({ reason })),
        );

      const subscribeCandle = (params: {
        coin: typeof CoinSchema.Type;
        interval: typeof CandleIntervalSchema.Type;
      }) =>
        Stream.callback<CandleData>((queue) =>
          Effect.gen(function* () {
            const subscription = yield* Effect.promise(() =>
              client.candle(params, (data) => {
                Queue.offerUnsafe(queue, data);
              }),
            );

            yield* Effect.addFinalizer(() =>
              Effect.promise(() => subscription.unsubscribe()),
            );
          }),
        );

      const subscribeMidPrice = Stream.callback<AllMidsWsEvent>((queue) =>
        Effect.gen(function* () {
          const subscription = yield* Effect.promise(() =>
            client.allMids({}, (data) => {
              Queue.offerUnsafe(queue, data);
            }),
          );

          yield* Effect.addFinalizer(() =>
            Effect.promise(() => subscription.unsubscribe()),
          );
        }),
      ).pipe(Stream.share({ capacity: "unbounded" }));

      return {
        candleSnapshot,
        subscribeCandle,
        subscribeMidPrice,
      };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}

export type CandleData = CandleWsEvent;

export const CoinSchema = Schema.String;
export const CandleIntervalSchema = Schema.Literals([
  "1m",
  "3m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "8h",
  "12h",
  "1d",
  "3d",
  "1w",
  "1M",
]);

export class GetCandleSnapshotError extends Schema.TaggedErrorClass<GetCandleSnapshotError>()(
  "GetCandleSnapshotError",
  {
    reason: Schema.Unknown,
  },
) {}
