import { Atom, type AtomRef, Result } from "@effect-atom/atom-react";
import { MarketNotFoundError, marketsAtom } from "@yieldxyz/perps-common/atoms";
import { type ApiTypes, runtimeAtom } from "@yieldxyz/perps-common/services";
import { Array as _Array, Effect, Option, Record } from "effect";

const initMarketAtom = runtimeAtom.atom((ctx) =>
  ctx.resultOnce(marketsAtom).pipe(
    Effect.andThen((markets) =>
      Record.findFirst(markets, (m) => m.value.baseAsset.symbol === "BTC").pipe(
        Option.map((v) => v[1]),
        Option.orElse(() => _Array.head(Record.values(markets))),
      ),
    ),
    Effect.catchTag("NoSuchElementException", () => new MarketNotFoundError()),
  ),
);

export const selectedMarketAtom = Atom.writable(
  (ctx) => ctx.get(initMarketAtom),
  (ctx, value: AtomRef.AtomRef<ApiTypes.MarketDto>) =>
    ctx.setSelf(Result.success(value)),
);
