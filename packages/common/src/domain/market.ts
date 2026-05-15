import { Schema } from "effect";
import * as ApiSchemas from "../services/api-client/api-schemas";
import { MarketId, ProviderId } from "./ids";
import { TokenInfo } from "./token";

const MarketFields = {
  ...ApiSchemas.MarketDto.fields,
  id: MarketId,
  providerId: ProviderId,
  baseAsset: TokenInfo,
  quoteAsset: TokenInfo,
};

export class Market extends Schema.Class<Market>("Market")(MarketFields) {}

export class MarketDetail extends Schema.Class<MarketDetail>("MarketDetail")({
  ...ApiSchemas.MarketDetailDto.fields,
  ...MarketFields,
  chartConfig: ApiSchemas.MarketDetailDto.fields.chartConfig,
}) {}

export class Candle extends Schema.Class<Candle>("Candle")({
  ...ApiSchemas.CandleDto.fields,
  open: Schema.NumberFromString,
  high: Schema.NumberFromString,
  low: Schema.NumberFromString,
  close: Schema.NumberFromString,
  volume: Schema.NumberFromString,
}) {}

export class CandlesResponse extends Schema.Class<CandlesResponse>(
  "CandlesResponse",
)({
  ...ApiSchemas.CandlesResponseDto.fields,
  marketId: MarketId,
  candles: Schema.Array(Candle),
}) {}
