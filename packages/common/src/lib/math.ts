import { Number as _Number, Option } from "effect";
import type {
  MarketDto,
  PositionDto,
} from "../services/api-client/api-schemas";

/**
 * The minimum leverage supported by the UI/SDK.
 *
 * Note: this was previously defined in `domain/market.ts`, but lives here since
 * it is tightly coupled to leverage-related math helpers.
 */
export const MIN_LEVERAGE = 1;

/**
 * A reasonable default max leverage fallback.
 *
 * Note: some markets provide their own leverage range; use `getMaxLeverage`.
 */
export const MAX_LEVERAGE = 40;

/**
 * Safely parses a decimal string to a number.
 *
 * Returns `fallback` when parsing fails.
 */
export const parseFloatOr = (value: string, fallback: number): number => {
  return _Number.parse(value).pipe(Option.getOrElse(() => fallback));
};

/**
 * Safely parses a decimal string to a number.
 *
 * Returns `0` when parsing fails.
 */
export const parseFloatOrZero = (value: string): number =>
  parseFloatOr(value, 0);

/**
 * Clamps a percentage into the \([0, 100]\) interval.
 */
export const clampPercent = (percent: number): number =>
  _Number.clamp({ minimum: 0, maximum: 100 })(percent);

/**
 * Computes \( \frac{part}{whole} \cdot 100 \) with safe handling for `whole <= 0`.
 */
export const percentOf = ({
  part,
  whole,
}: {
  part: number;
  whole: number;
}): number => {
  if (whole <= 0) return 0;
  return (part / whole) * 100;
};

/**
 * Computes `total * percent/100`.
 */
export const valueFromPercent = ({
  total,
  percent,
}: {
  total: number;
  percent: number;
}): number => total * (percent / 100);

/**
 * Applies a percentage delta to a value: `value * (1 + percent/100)`.
 *
 * This is commonly used for "quick adjust" UI controls (e.g. `-1%`, `-5%`).
 */
export const applyPercentDelta = ({
  value,
  percent,
}: {
  value: number;
  percent: number;
}): number => value * (1 + percent / 100);

/**
 * Estimates the 24h low/high from a current price and an absolute change magnitude.
 *
 * This is useful when the backend provides `priceChange24h` but not the explicit low/high.
 */
export const estimateLowHighFromAbsoluteChange = ({
  currentPrice,
  priceChange24h,
}: {
  currentPrice: number;
  priceChange24h: number;
}): { low: number; high: number } => {
  const d = Math.abs(priceChange24h);
  return { low: currentPrice - d, high: currentPrice + d };
};

/**
 * Computes the notional value (USD) given a price and size.
 *
 * `sizeBase` can be either a number or a decimal string coming from DTOs.
 */
export const calcNotionalUsd = ({
  priceUsd,
  sizeBase,
}: {
  priceUsd: number;
  sizeBase: number | string;
}): number => {
  const s =
    typeof sizeBase === "string" ? parseFloatOrZero(sizeBase) : sizeBase;
  return priceUsd * s;
};

/**
 * Computes PnL% = (pnl / margin) * 100 with safe handling for `margin <= 0`.
 */
export const calcPnlPercent = ({
  pnlUsd,
  marginUsd,
}: {
  pnlUsd: number;
  marginUsd: number;
}): number => (marginUsd > 0 ? (pnlUsd / marginUsd) * 100 : 0);

/**
 * Converts a USD amount into a crypto/base amount using a USD price.
 */
export const calcBaseAmountFromUsd = ({
  usdAmount,
  priceUsd,
}: {
  usdAmount: number;
  priceUsd: number;
}): number => {
  if (priceUsd <= 0) return 0;
  return usdAmount / priceUsd;
};

/**
 * Converts a crypto/base amount into USD using a USD price.
 */
export const calcUsdFromBaseAmount = ({
  baseAmount,
  priceUsd,
}: {
  baseAmount: number;
  priceUsd: number;
}): number => baseAmount * priceUsd;

/**
 * Truncates a number down to the given decimal precision.
 *
 * Example: `round(1.239, 2) -> 1.23`
 */
export const round = (number: number, precision: number = 2) =>
  _Number.round(number, precision);

/**
 * Computes max leverage from the leverage range (falls back to `MAX_LEVERAGE`).
 */
export const getMaxLeverage = (
  leverages: MarketDto["leverageRange"],
): number =>
  leverages.length > 0
    ? (leverages[leverages.length - 1] ?? MAX_LEVERAGE)
    : MAX_LEVERAGE;

/**
 * Generic percent change between two prices: \(\frac{current - reference}{reference} \cdot 100\).
 */
export const getPriceChangePercent = ({
  currentPrice,
  pastOrFuturePrice,
}: {
  currentPrice: number;
  pastOrFuturePrice: number;
}) => {
  if (pastOrFuturePrice === 0) return 100;
  return ((currentPrice - pastOrFuturePrice) / pastOrFuturePrice) * 100;
};

/**
 * Price change percent for a position relative to entry.
 */
export const getPositionChangePercent = (position: PositionDto) =>
  getPriceChangePercent({
    currentPrice: position.markPrice,
    pastOrFuturePrice: position.entryPrice,
  });

/**
 * Calculates the liquidation price given a current price, leverage and side.
 */
export const getLiquidationPrice = ({
  currentPrice,
  leverage,
  side,
}: {
  currentPrice: number;
  leverage: number;
  side: "long" | "short";
}) =>
  side === "long"
    ? currentPrice * (1 - 1 / leverage)
    : currentPrice * (1 + 1 / leverage);

/**
 * Percent price change needed to reach liquidation.
 */
export const getPriceChangePercentToLiquidation = ({
  currentPrice,
  liquidationPrice,
}: {
  currentPrice: number;
  liquidationPrice: number;
}) =>
  getPriceChangePercent({
    currentPrice,
    pastOrFuturePrice: liquidationPrice,
  });

/**
 * Maps a leverage into slider percent space between `MIN_LEVERAGE` and `maxLeverage`.
 */
export const getLeveragePercent = ({
  leverage,
  maxLeverage,
}: {
  leverage: number;
  maxLeverage: number;
}) => ((leverage - MIN_LEVERAGE) / (maxLeverage - MIN_LEVERAGE)) * 100;

/**
 * Converts a slider percent \([0..100]\) into a leverage value between
 * `MIN_LEVERAGE` and `maxLeverage`.
 */
export const getLeverageFromPercent = ({
  percent,
  maxLeverage,
}: {
  percent: number;
  maxLeverage: number;
}): number => {
  const p = clampPercent(percent);
  return Math.round(MIN_LEVERAGE + (p / 100) * (maxLeverage - MIN_LEVERAGE));
};

/**
 * Recommended leverage slider "stop" markers.
 */
export const getLeverageStops = (maxLeverage: number): number[] => [
  MIN_LEVERAGE,
  Math.round(maxLeverage / 2),
  maxLeverage,
];

/**
 * Generates common leverage button presets (2x, 5x, 10x, 20x... up to max).
 */
export const generateLeverageButtons = (maxLeverage: number): number[] => {
  const buttons: number[] = [];

  if (maxLeverage >= 2) {
    buttons.push(2);
  }

  if (maxLeverage >= 5) {
    buttons.push(5);
  }

  let value = 10;
  while (value <= maxLeverage) {
    buttons.push(value);
    value *= 2;
  }

  if (buttons[buttons.length - 1] !== maxLeverage && maxLeverage > 2) {
    buttons.push(maxLeverage);
  }

  return [...new Set(buttons)].sort((a, b) => a - b);
};

/**
 * Calculates required margin for a notional position size and leverage.
 */
export const calculateMargin = ({
  positionSize,
  leverage,
}: {
  positionSize: number;
  leverage: number;
}) => {
  if (leverage <= 0) return positionSize;
  return positionSize / leverage;
};

/**
 * Calculates notional position size from margin and leverage.
 */
export const calculatePositionSize = ({
  margin,
  leverage,
}: {
  margin: number;
  leverage: number;
}) => margin * leverage;

/**
 * Computes close-related UI calculations for a given close percentage.
 */
export const getCloseCalculations = (
  position: PositionDto,
  closePercentage: number,
) => {
  const ratio = closePercentage / 100;
  const sizeNum = parseFloatOrZero(position.size);
  const positionValue = position.markPrice * sizeNum;
  const closeValue = positionValue * ratio;
  const marginReturn = position.margin * ratio;
  const pnlReturn = position.unrealizedPnl * ratio;
  const youWillReceive = marginReturn + pnlReturn;
  const closeSize = sizeNum * ratio;
  const closeSizeInMarketPrice = round(
    closeSize * position.markPrice,
    6,
  ).toString();

  return {
    closeValue,
    marginReturn,
    pnlReturn,
    youWillReceive,
    closeSize,
    closeSizeInMarketPrice,
  };
};

export type TpSlKind = "takeProfit" | "stopLoss";

/**
 * Returns the "+" / "-" prefix used for TP/SL percent labels.
 */
export const getTpSlPercentPrefix = ({
  side,
  tpOrSl,
}: {
  side: "long" | "short";
  tpOrSl: TpSlKind;
}): "+" | "-" => {
  if (side === "short") {
    return tpOrSl === "takeProfit" ? "-" : "+";
  }
  return tpOrSl === "takeProfit" ? "+" : "-";
};

/**
 * Calculates a TP/SL trigger price from entry and a (positive) percent move.
 */
export const calcTpSlTriggerPriceFromPercent = ({
  entryPrice,
  percent,
  side,
  tpOrSl,
}: {
  entryPrice: number;
  percent: number;
  side: "long" | "short";
  tpOrSl: TpSlKind;
}): number => {
  const p = percent / 100;
  const prefix = getTpSlPercentPrefix({ side, tpOrSl });
  return prefix === "+" ? entryPrice * (1 + p) : entryPrice * (1 - p);
};

/**
 * Calculates the (positive) percent move between entry and trigger price for TP/SL.
 */
export const calcTpSlPercentFromTriggerPrice = ({
  entryPrice,
  triggerPrice,
  side,
  tpOrSl,
}: {
  entryPrice: number;
  triggerPrice: number;
  side: "long" | "short";
  tpOrSl: TpSlKind;
}): number => {
  if (entryPrice <= 0) return 0;
  const prefix = getTpSlPercentPrefix({ side, tpOrSl });
  const raw =
    prefix === "+"
      ? ((triggerPrice - entryPrice) / entryPrice) * 100
      : ((entryPrice - triggerPrice) / entryPrice) * 100;
  return raw;
};

/**
 * Default TP/SL percent presets used by the widget UI.
 */
export const DEFAULT_TP_SL_PERCENT_OPTIONS = [0, 10, 25, 50, 100] as const;
type DefaultTpSlPercentOption = (typeof DEFAULT_TP_SL_PERCENT_OPTIONS)[number];

/**
 * Finds a matching percent option within a tolerance.
 */
export const findMatchingPercentOption = <T extends number>({
  percent,
  options,
  tolerance = 0.5,
}: {
  percent: number;
  options: ReadonlyArray<T>;
  tolerance?: number;
}): T | null =>
  options.find((opt) => Math.abs(percent - opt) < tolerance) ?? null;

/**
 * Computes TP/SL configuration (percentage + option) from a trigger price.
 *
 * This is used to prefill UI when the backend provides an existing TP/SL order.
 */
export function getTPOrSLConfigurationFromPosition(args: {
  entryPrice: number;
  amount: number | undefined;
  tpOrSl: TpSlKind;
  side?: "long" | "short";
}): {
  option: DefaultTpSlPercentOption | null;
  triggerPrice: number | null;
  percentage: number | null;
};
export function getTPOrSLConfigurationFromPosition<T extends number>(args: {
  entryPrice: number;
  amount: number | undefined;
  tpOrSl: TpSlKind;
  side?: "long" | "short";
  options: ReadonlyArray<T>;
}): {
  option: T | null;
  triggerPrice: number | null;
  percentage: number | null;
};
export function getTPOrSLConfigurationFromPosition<T extends number>({
  amount,
  entryPrice,
  tpOrSl,
  side = "long",
  options,
}: {
  entryPrice: number;
  amount: number | undefined;
  tpOrSl: TpSlKind;
  side?: "long" | "short";
  options?: ReadonlyArray<T>;
}): {
  option: T | DefaultTpSlPercentOption | null;
  triggerPrice: number | null;
  percentage: number | null;
} {
  const optList =
    options ?? (DEFAULT_TP_SL_PERCENT_OPTIONS as unknown as ReadonlyArray<T>);
  const percentage =
    amount === undefined
      ? null
      : calcTpSlPercentFromTriggerPrice({
          entryPrice,
          triggerPrice: amount,
          side,
          tpOrSl,
        });

  const option =
    percentage === null || percentage === 0
      ? null
      : findMatchingPercentOption({ percent: percentage, options: optList });

  return {
    option,
    triggerPrice: amount || null,
    percentage,
  };
}
