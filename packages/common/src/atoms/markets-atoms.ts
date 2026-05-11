import {
  Array as _Array,
  Data,
  Duration,
  Effect,
  pipe,
  Record,
  Schedule,
  Stream,
} from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as AtomRef from "effect/unstable/reactivity/AtomRef";
import { ApiClientService } from "../services/api-client";
import type { ProviderDto } from "../services/api-client/api-schemas";
import { runtimeAtom } from "../services/runtime";
import { midPriceAtom } from "./hyperliquid-atoms";
import { selectedProviderAtom } from "./providers-atoms";

const DEFAULT_LIMIT = 50;

const getAllMarkets = Effect.fn(function* (selectedProvider: ProviderDto) {
  const client = yield* ApiClientService;

  const firstPage = yield* client.MarketsControllerGetMarkets({
    params: {
      providerId: selectedProvider.id as "hyperliquid" | "hyperliquid-xyz",
      limit: DEFAULT_LIMIT,
      offset: 0,
    },
  });

  const totalPages = Math.ceil(firstPage.total / DEFAULT_LIMIT);

  const restPages = yield* Effect.all(
    Array.from({
      length: totalPages - 1,
    }).map((_, index) =>
      client
        .MarketsControllerGetMarkets({
          params: {
            providerId: selectedProvider.id as
              | "hyperliquid"
              | "hyperliquid-xyz",
            offset: (index + 1) * DEFAULT_LIMIT,
            limit: DEFAULT_LIMIT,
          },
        })
        .pipe(Effect.option),
    ),
    { concurrency: "unbounded" },
  ).pipe(Effect.map(_Array.getSomes));

  return [
    ...(firstPage.items ?? []),
    ...restPages.flatMap((page) => page.items ?? []),
  ];
});

export const marketsAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const selectedProvider = yield* ctx.result(selectedProviderAtom);

    const markets = yield* getAllMarkets(selectedProvider);

    return Record.fromIterableBy(
      markets.map((market) => AtomRef.make(market)),
      (m) => m.value.id,
    );
  }),
);

export const marketsBySymbolAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const markets = yield* ctx.result(marketsAtom);

    return pipe(
      Record.values(markets),
      _Array.map(
        (marketRef) => [marketRef.value.baseAsset.symbol, marketRef] as const,
      ),
      Record.fromEntries,
    );
  }),
);

export class MarketNotFoundError extends Data.TaggedError(
  "MarketNotFoundError",
) {}

export const marketAtom = Atom.family((marketId: string) =>
  runtimeAtom.atom(
    Effect.fn(function* (ctx) {
      const markets = yield* ctx.result(marketsAtom);
      const record = Record.get(markets, marketId);

      if (record._tag === "None") {
        return yield* new MarketNotFoundError();
      }

      return record.value;
    }),
  ),
);

export const refreshMarketsAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const selectedProvider = yield* ctx.result(selectedProviderAtom);

    yield* Stream.fromSchedule(
      Schedule.forever.pipe(
        Schedule.addDelay(() => Effect.succeed(Duration.minutes(1))),
      ),
    ).pipe(
      Stream.mapEffect(() => getAllMarkets(selectedProvider)),
      Stream.tap((markets) =>
        ctx.result(marketsAtom).pipe(
          Effect.tap((prevMarkets) =>
            Effect.sync(() => {
              markets.forEach((market) => {
                const prevMarket = Record.get(prevMarkets, market.id);

                if (prevMarket._tag === "None") {
                  return;
                }

                prevMarket.value.set(market);
              });
            }),
          ),
        ),
      ),
      Stream.runDrain,
    );
  }),
);

export const updateMarketsMidPriceAtom = runtimeAtom.atom((ctx) =>
  Effect.gen(function* () {
    const { mids } = yield* ctx.result(midPriceAtom);

    const markets = yield* ctx.result(marketsBySymbolAtom);

    Record.toEntries(mids).forEach(([symbol, price]) => {
      const parsed = Number(price);

      if (!Number.isFinite(parsed)) {
        return;
      }

      const marketRef = Record.get(markets, symbol);

      if (marketRef._tag === "None") {
        return;
      }

      const currentMarket = marketRef.value.value;

      if (currentMarket.markPrice === parsed) {
        return;
      }

      marketRef.value.update((market) => ({
        ...market,
        markPrice: parsed,
      }));
    });
  }),
);
