import { Duration } from "effect";
import {
  type ChartOptions,
  ColorType,
  type DeepPartial,
} from "lightweight-charts";
import { formatAmount } from "../../../lib";
import { CandleIntervalSchema } from "../../../services";

export type ChartVariant = "widget" | "dashboard";

export const CHART_INTERVALS = CandleIntervalSchema.literals.map(
  (interval) => ({ value: interval, label: interval }) as const,
);

export const INITIAL_INTERVAL = CandleIntervalSchema.literals[0];

export const DEFAULT_CHART_OPTIONS: DeepPartial<ChartOptions> = {
  layout: {
    background: { type: ColorType.Solid, color: "#000000" },
    textColor: "#9598a1",
  },
  grid: {
    vertLines: { color: "rgba(74, 74, 74, 0.51)" },
    horzLines: { color: "rgba(74, 74, 74, 0.51)" },
  },
  rightPriceScale: { borderColor: "transparent" },
  localization: {
    priceFormatter: (price: number) =>
      formatAmount(price, { symbol: null, maximumFractionDigits: 2 }),
  },
  timeScale: {
    borderColor: "transparent",
    timeVisible: true,
    secondsVisible: false,
  },
};

export const CANDLE_UP_COLOR = "#26a69a";
export const CANDLE_DOWN_COLOR = "#ef5350";
export const CHART_RIGHT_BARS_PADDING = 5;
export const CHART_VARIANT_TO_VISIBLE_BARS_COUNT: Record<ChartVariant, number> =
  {
    dashboard: 120,
    widget: 30,
  };
export const HISTORY_PRELOAD_THRESHOLD = 10;

export const INTERVAL_TO_START_DATA_LOOKBACK_DURATION: Record<
  typeof CandleIntervalSchema.Type,
  Duration.Duration
> = {
  "1m": Duration.days(1),
  "5m": Duration.days(2),
  "15m": Duration.days(4),
  "30m": Duration.days(8),
  "1h": Duration.days(16),
  "4h": Duration.days(32),
  "1d": Duration.days(64),
};
