import { Data, Option, Order, Record, Schema } from "effect";

export const DEFAULT_LIMIT = 50;

// -----------------------------------------------------------------------------
// Schemas
// -----------------------------------------------------------------------------
export const ProviderId = Schema.String.pipe(Schema.brand("ProviderId"));

export const CompareCurrencySchema = Schema.Literal("USD", "USDC", "USDT");

export const currencyPriorityRecord: Record<
  typeof CompareCurrencySchema.Type,
  number
> = {
  USD: 0,
  USDC: 1,
  USDT: 2,
};

export const BaseSymbolSchema = Schema.String.pipe(Schema.brand("BaseSymbol"));

export const TokenDto = Schema.Struct({ symbol: BaseSymbolSchema });

export const ProviderDto = Schema.Struct({
  id: Schema.String,
  name: Schema.optionalWith(Schema.String, { nullable: true }),
});

export const MarketDto = Schema.Struct({
  id: Schema.String,
  providerId: Schema.String,
  baseAsset: TokenDto,
  quoteAsset: TokenDto,
});

export const MarketsResponse = Schema.Struct({
  total: Schema.Number,
  offset: Schema.Number,
  limit: Schema.Number,
  items: Schema.optionalWith(Schema.Array(MarketDto), { nullable: true }),
});

export const ProvidersResponse = Schema.Array(ProviderDto);

export const TradingViewSearchResponse = Schema.Struct({
  symbols: Schema.Array(
    Schema.Struct({
      symbol: Schema.String, // e.g. ETHUSD
      exchange: Schema.String,
      provider_id: ProviderId,
    }),
  ),
});

const CheckTradingViewSymbolResult = Schema.Union(
  Schema.Struct({
    status: Schema.Literal("match"),
    perpsSymbol: Schema.String,
    tradingViewSymbol: Schema.String,
    providerId: Schema.String,
  }),
  Schema.Struct({
    status: Schema.Literal("noMatch"),
    perpsSymbol: Schema.String,
  }),
  Schema.Struct({
    status: Schema.Literal("error"),
    perpsSymbol: Schema.String,
  }),
);

// -----------------------------------------------------------------------------
// Error Types
// -----------------------------------------------------------------------------
export class HttpError extends Data.TaggedError("HttpError")<{
  message: string;
  cause?: unknown;
}> {}

// -----------------------------------------------------------------------------
// Utilities
// -----------------------------------------------------------------------------

export const exchangePriorityRecord: Record<typeof ProviderId.Type, number> = {
  [ProviderId.make("coinbase")]: 0,
  [ProviderId.make("binance")]: 1,
  [ProviderId.make("cryptocom")]: 2,
  [ProviderId.make("kraken")]: 3,
  [ProviderId.make("okx")]: 4,
  [ProviderId.make("cryptocap")]: 5,
};

export const normalizeSymbol = <T extends string>(symbol: T): T =>
  symbol
    .replace(/<\/?em>/g, "")
    .trim()
    .toUpperCase() as T;

export const makeResult = Schema.decodeSync(CheckTradingViewSymbolResult);

const byCurrency = Order.mapInput(
  Order.number,
  (val: (typeof TradingViewSearchResponse.Type)["symbols"][number]) => {
    const compareSymbol = Schema.decodeUnknownOption(
      Schema.TemplateLiteralParser(
        Schema.String,
        Schema.Literal("USD", "USDC", "USDT"),
      ),
    )(val.symbol).pipe(
      Option.map((v) => v[1]),
      Option.getOrElse(() => null),
    );

    if (!compareSymbol) return 999;

    return Record.get(currencyPriorityRecord, compareSymbol).pipe(
      Option.getOrElse(() => 999),
    );
  },
);

const byProvider = Order.mapInput(
  Order.number,
  (val: (typeof TradingViewSearchResponse.Type)["symbols"][number]) =>
    Record.get(exchangePriorityRecord, val.provider_id).pipe(
      Option.getOrElse(() => 999),
    ),
);

export const byProviderAndCurrency = Order.combine(byCurrency, byProvider);

export const compareSymbolsFromBaseSymbol = (
  baseSymbol: typeof BaseSymbolSchema.Type,
) => {
  const compareSymbols = Schema.decodeSync(
    Schema.Array(
      Schema.TemplateLiteral(BaseSymbolSchema, CompareCurrencySchema),
    ),
  )(
    CompareCurrencySchema.literals.map(
      (currency) => `${baseSymbol}${currency}` as const,
    ),
  );

  return [...compareSymbols, baseSymbol];
};
