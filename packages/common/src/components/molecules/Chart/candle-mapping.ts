import type { UTCTimestamp } from "lightweight-charts";
import type { CandleData } from "../../../services/hyperliquid";

export type LwcCandleBar = {
  time: UTCTimestamp;
  open: number;
  high: number;
  low: number;
  close: number;
};

/**
 * Hyperliquid candles use t (ms), o/h/l/c (string or number). Lightweight-charts
 * expects time in UTC seconds and numeric OHLC.
 */
export function hyperliquidCandleToLwcBar(c: CandleData): LwcCandleBar {
  return {
    time: Math.floor(c.t / 1000) as UTCTimestamp,
    open: Number(c.o),
    high: Number(c.h),
    low: Number(c.l),
    close: Number(c.c),
  };
}
