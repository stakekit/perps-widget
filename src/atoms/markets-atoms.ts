import { Atom } from "@effect-atom/atom-react";
import { Data, Effect, Record } from "effect";
import { ApiClientService } from "@/services/api-client";
import { runtimeAtom } from "@/services/runtime";

const DEFAULT_LIMIT = 50;

export const marketsAtom = runtimeAtom
  .atom(
    Effect.gen(function* () {
      const client = yield* ApiClientService;

      const firstPage = yield* client.MarketsControllerGetMarkets({
        limit: DEFAULT_LIMIT,
        offset: 0,
      });
      const totalPages = Math.ceil(firstPage.total / DEFAULT_LIMIT);

      const restPages = yield* Effect.all(
        Array.from({
          length: totalPages - 1,
        }).map((_, index) =>
          client.MarketsControllerGetMarkets({
            offset: (index + 1) * DEFAULT_LIMIT,
            limit: DEFAULT_LIMIT,
          }),
        ),
        { concurrency: "unbounded" },
      );

      return [
        ...(firstPage.items ?? []),
        ...restPages.flatMap((page) => page.items ?? []),
      ];
    }),
  )
  .pipe(Atom.keepAlive);

export const marketsMapAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const markets = yield* ctx.result(marketsAtom);

    return Record.fromIterableBy(markets, (m) => m.id);
  }),
);

export class MarketNotFoundError extends Data.TaggedError(
  "MarketNotFoundError",
) {}

export const marketAtom = Atom.family((marketId: string) =>
  runtimeAtom.atom(
    Effect.fn(function* (ctx) {
      const marketsMap = yield* ctx.result(marketsMapAtom);
      const record = Record.get(marketsMap, marketId);

      if (record._tag === "None") {
        return yield* new MarketNotFoundError();
      }

      return record.value;
    }),
  ),
);
