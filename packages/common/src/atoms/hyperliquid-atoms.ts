import { Effect, Stream } from "effect";
import { HyperliquidService, runtimeAtom } from "../services";

export const midPriceAtom = runtimeAtom.atom(
  HyperliquidService.pipe(
    Effect.andThen((service) => service.subscribeMidPrice),
    Stream.unwrap,
  ),
);
