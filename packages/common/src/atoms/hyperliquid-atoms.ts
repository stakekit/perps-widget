import { Stream } from "effect";
import { HyperliquidService, runtimeAtom } from "../services";

export const midPriceAtom = runtimeAtom.atom(
  Stream.unwrap(
    HyperliquidService.use((service) => service.subscribeMidPrice),
  ).pipe(Stream.scoped),
);
