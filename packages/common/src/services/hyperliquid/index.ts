import type { AllMidsWsEvent, CandleWsEvent } from "@nktkas/hyperliquid";
import {
  HttpTransport,
  InfoClient,
  SubscriptionClient,
  WebSocketTransport,
} from "@nktkas/hyperliquid";
import { Chunk, Effect, Schema, Stream } from "effect";

export class HyperliquidService extends Effect.Service<HyperliquidService>()(
  "perps/services/hyperliquid/HyperliquidService",
  {
    scoped: Effect.gen(function* () {
      const transport = new WebSocketTransport();
      const client = new SubscriptionClient({ transport });

      const httpTransport = new HttpTransport();
      const infoClient = new InfoClient({ transport: httpTransport });

      const candleSnapshot = (params: {
        coin: typeof CoinSchema.Type;
        interval: typeof CandleIntervalSchema.Type;
        startTime: number;
        endTime?: number;
      }) =>
        Effect.tryPromise(() => infoClient.candleSnapshot(params)).pipe(
          Effect.catchAll((cause) => new GetCandleSnapshotError({ cause })),
        );

      const subscribeCandle = (params: {
        coin: typeof CoinSchema.Type;
        interval: typeof CandleIntervalSchema.Type;
      }) =>
        Stream.asyncScoped<CandleData>((emit) =>
          Effect.gen(function* () {
            const subscription = yield* Effect.promise(() =>
              client.candle(params, (data) => {
                emit(Effect.succeed(Chunk.of(data)));
              }),
            );

            yield* Effect.addFinalizer(() =>
              Effect.promise(() => subscription.unsubscribe()),
            );
          }),
        );

      const subscribeMidPrice = Stream.asyncScoped<AllMidsWsEvent>((emit) =>
        Effect.gen(function* () {
          const subscription = yield* Effect.promise(() =>
            client.allMids({}, (data) => {
              emit(Effect.succeed(Chunk.of(data)));
            }),
          );

          yield* Effect.addFinalizer(() =>
            Effect.promise(() => subscription.unsubscribe()),
          );
        }),
      );

      return {
        candleSnapshot,
        subscribeCandle,
        subscribeMidPrice,
      };
    }),
  },
) {}

export type CandleData = CandleWsEvent;

export const CoinSchema = Schema.String;
export const CandleIntervalSchema = Schema.Literal(
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
);

export class GetCandleSnapshotError extends Schema.TaggedError<GetCandleSnapshotError>()(
  "GetCandleSnapshotError",
  {
    cause: Schema.Unknown,
  },
) {}
