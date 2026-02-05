import { writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Array as _Array, Config, Effect, Layer, Logger } from "effect";
import {
  type BaseSymbolSchema,
  byProviderAndCurrency,
  compareSymbolsFromBaseSymbol,
  DEFAULT_LIMIT,
  HttpError,
  MarketsResponse,
  makeResult,
  normalizeSymbol,
  ProvidersResponse,
  TradingViewSearchResponse,
} from "./utils";

// -----------------------------------------------------------------------------
// HttpClient Services
// -----------------------------------------------------------------------------
class PerpsClient extends Effect.Service<PerpsClient>()(
  "perps/scripts/audit-tradingview-symbols/PerpsClient",
  {
    dependencies: [FetchHttpClient.layer],
    effect: Effect.gen(function* () {
      const baseUrl = yield* Config.string("PERPS_BASE_URL");
      const apiKey = yield* Config.string("PERPS_API_KEY");
      const client = yield* HttpClient.HttpClient;

      return client.pipe(
        HttpClient.mapRequest((req) =>
          req.pipe(
            HttpClientRequest.prependUrl(baseUrl),
            HttpClientRequest.setHeader("X-API-KEY", apiKey),
          ),
        ),
      );
    }),
  },
) {}

class TradingViewClient extends Effect.Service<TradingViewClient>()(
  "perps/scripts/audit-tradingview-symbols/TradingViewClient",
  {
    dependencies: [FetchHttpClient.layer],
    effect: Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      return client.pipe(
        HttpClient.mapRequest((req) =>
          req.pipe(
            HttpClientRequest.setHeaders({
              Accept: "application/json, text/plain, */*",
              Referer: "https://www.tradingview.com/",
              origin: "https://www.tradingview.com",
            }),
            HttpClientRequest.prependUrl(
              "https://symbol-search.tradingview.com/",
            ),
          ),
        ),
      );
    }),
  },
) {}

// -----------------------------------------------------------------------------
// API Functions
// -----------------------------------------------------------------------------

const getProviders = Effect.gen(function* () {
  const perpsClient = yield* PerpsClient;

  return yield* HttpClientRequest.get("/v1/providers").pipe(
    perpsClient.execute,
    Effect.flatMap(HttpClientResponse.schemaBodyJson(ProvidersResponse)),
    Effect.mapError(
      (error) =>
        new HttpError({
          message: "Failed to fetch providers",
          cause: error,
        }),
    ),
  );
});

const getMarketsPage = Effect.fn(function* ({
  providerId,
  offset,
  limit,
}: {
  providerId: string;
  offset: number;
  limit: number;
}) {
  const perpsClient = yield* PerpsClient;

  return yield* HttpClientRequest.get("/v1/markets").pipe(
    HttpClientRequest.setUrlParams({
      providerId,
      offset,
      limit,
    }),
    perpsClient.execute,
    Effect.flatMap(HttpClientResponse.schemaBodyJson(MarketsResponse)),
    Effect.mapError(
      (error) =>
        new HttpError({
          message: `Failed to fetch markets for provider ${providerId}`,
          cause: error,
        }),
    ),
  );
});

const getAllMarketsForProvider = Effect.fn(function* (providerId: string) {
  const firstPage = yield* getMarketsPage({
    providerId,
    offset: 0,
    limit: DEFAULT_LIMIT,
  });

  const totalPages = Math.ceil(firstPage.total / DEFAULT_LIMIT);
  const restPages = yield* Effect.allSuccesses(
    Array.from({ length: totalPages - 1 }).map((_, index) =>
      getMarketsPage({
        providerId,
        offset: (index + 1) * DEFAULT_LIMIT,
        limit: DEFAULT_LIMIT,
      }),
    ),
  );

  return [
    ...(firstPage.items ?? []),
    ...restPages.flatMap((page) => page.items ?? []),
  ];
});

const searchTradingViewSymbol = (
  tvClient: HttpClient.HttpClient,
  searchText: string,
) =>
  HttpClientRequest.get("/symbol_search/v3/").pipe(
    HttpClientRequest.setUrlParams({
      text: searchText,
      hl: "1",
      exchange: "",
      lang: "en",
      search_type: "crypto",
      domain: "production",
      sort_by_country: "US",
      promo: "true",
    }),
    tvClient.execute,
    Effect.flatMap(
      HttpClientResponse.schemaBodyJson(TradingViewSearchResponse),
    ),
    Effect.mapError(
      (error) =>
        new HttpError({
          message: `TradingView search failed for "${searchText}"`,
          cause: error,
        }),
    ),
  );

const checkTradingViewSymbol = Effect.fn(function* (
  baseSymbol: typeof BaseSymbolSchema.Type,
) {
  const tvClient = yield* TradingViewClient;

  const normalizedBase = normalizeSymbol(baseSymbol);

  return yield* searchTradingViewSymbol(tvClient, normalizedBase).pipe(
    Effect.map((response) => {
      const results = _Array.sort(response.symbols, byProviderAndCurrency);

      const compareSymbols = compareSymbolsFromBaseSymbol(normalizedBase);

      const matchedResult = _Array.findFirst(results, (result) => {
        const resultSymbol = normalizeSymbol(result.symbol);

        return _Array.some(compareSymbols, (symbol) => resultSymbol === symbol);
      });

      if (matchedResult._tag === "Some") {
        return makeResult({
          status: "match",
          perpsSymbol: baseSymbol,
          tradingViewSymbol: normalizeSymbol(matchedResult.value.symbol),
          providerId: matchedResult.value.provider_id.toUpperCase(),
        });
      }

      return makeResult({
        status: "noMatch",
        perpsSymbol: baseSymbol,
      });
    }),
    Effect.tapError(Effect.logError),
    Effect.catchTag("HttpError", () =>
      Effect.succeed(
        makeResult({
          status: "error",
          perpsSymbol: baseSymbol,
        }),
      ),
    ),
  );
});

// -----------------------------------------------------------------------------
// Main Program
// -----------------------------------------------------------------------------

const program = Effect.gen(function* () {
  const providers = yield* getProviders;
  const marketsByProvider = yield* Effect.all(
    providers.map((provider) =>
      getAllMarketsForProvider(provider.id).pipe(
        Effect.map((markets) => ({ provider, markets })),
      ),
    ),
    { concurrency: "unbounded" },
  );

  const allMarkets = marketsByProvider.flatMap(({ markets }) => markets);

  const results = yield* Effect.all(
    allMarkets.map((market) => checkTradingViewSymbol(market.baseAsset.symbol)),
    { concurrency: 10 },
  );

  const matched = results.filter((result) => result.status === "match");

  const nonMatched = results.filter((result) => result.status !== "match");

  yield* Effect.log("Not matched: ", JSON.stringify(nonMatched, null, 2));

  const path = join(
    dirname(fileURLToPath(import.meta.url)),
    "..",
    "src",
    "assets",
    "tradingview-symbols.json",
  );

  yield* Effect.tryPromise(() =>
    writeFile(path, `${JSON.stringify(matched, null, 2)}\n`, "utf-8"),
  );
});

const layer = Layer.mergeAll(
  PerpsClient.Default,
  TradingViewClient.Default,
  Logger.pretty,
);

program.pipe(Effect.provide(layer), Effect.runPromise);
