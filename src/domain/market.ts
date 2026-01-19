import { Array as _Array, Option } from "effect";
import type { MarketDto } from "@/services/api-client/api-schemas";

export const MIN_LEVERAGE = 1;
export const MAX_LEVERAGE = 40;

export const getMaxLeverage = (leverages: MarketDto["leverageRange"]): number =>
  _Array.last(leverages).pipe(Option.getOrElse(() => MAX_LEVERAGE));
