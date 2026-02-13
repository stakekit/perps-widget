import { Atom } from "@effect-atom/atom-react";
import { Effect, Schema, Stream } from "effect";
import {
  CandleIntervalSchema,
  CoinSchema,
  HyperliquidService,
} from "../services/hyperliquid";
import { runtimeAtom } from "../services/runtime";

export const CandleSubscriptionParams = Schema.Data(
  Schema.Struct({
    coin: CoinSchema,
    interval: CandleIntervalSchema,
  }),
);

export const candleStreamAtom = Atom.family(
  (params: typeof CandleSubscriptionParams.Type) =>
    runtimeAtom.atom(
      HyperliquidService.pipe(
        Effect.andThen((service) =>
          service.subscribeCandle({
            coin: params.coin,
            interval: params.interval,
          }),
        ),
        Stream.unwrap,
      ),
    ),
);
