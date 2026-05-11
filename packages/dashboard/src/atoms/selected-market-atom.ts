import { MarketNotFoundError, marketsAtom } from "@yieldxyz/perps-common/atoms";
import { type ApiTypes, runtimeAtom } from "@yieldxyz/perps-common/services";
import { Array as _Array, Effect, Option, Record } from "effect";
import * as Result from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";
import type * as AtomRef from "effect/unstable/reactivity/AtomRef";

const initMarketAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const markets = yield* ctx.result(marketsAtom);

    const initialMarket = Record.findFirst(
      markets,
      (m) => m.value.baseAsset.symbol === "BTC",
    ).pipe(
      Option.map((v) => v[1]),
      Option.orElse(() => _Array.head(Record.values(markets))),
    );

    if (initialMarket._tag === "None") {
      return yield* new MarketNotFoundError();
    }

    return initialMarket.value;
  }),
);

export const selectedMarketAtom = Atom.writable(
  (ctx) => ctx.get(initMarketAtom),
  (ctx, value: AtomRef.AtomRef<ApiTypes.MarketDto>) =>
    ctx.setSelf(Result.success(value)),
);
