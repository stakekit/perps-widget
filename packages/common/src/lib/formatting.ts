/**
 * Formatting helpers (display-only).
 *
 * Keep this module free of business logic / calculations; those live in `lib/math.ts`.
 */

import { Option } from "effect";
import type { TPOrSLSettings } from "../components/molecules/tp-sl-dialog";

const tokenAmountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

/**
 * Formats a token amount as `"SYMBOL 1.2345"`.
 */
export const formatTokenAmount = ({
  amount,
  symbol,
}: {
  amount: number | string;
  symbol: string;
}) => {
  const parsedAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return `${symbol} ${tokenAmountFormatter.format(parsedAmount)}`;
};

/**
 * Formats a USD-like amount with adaptive decimals and optional sign.
 *
 * This is used widely across the widget UI for prices, balances, margin, PnL, etc.
 *
 * Negative values are formatted as `-$37.1` (minus before symbol).
 */
export const formatAmount = (
  amount: number | string,
  options = { symbol: "$" } as {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
    withSign?: boolean;
    symbol?: string | null;
  },
): string => {
  const amountNumber = typeof amount === "string" ? parseFloat(amount) : amount;
  const symbol = options.symbol !== null ? (options.symbol ?? "$") : "";
  const isNegative = amountNumber < 0;
  const absAmount = Math.abs(amountNumber);

  const hasCustomDigits =
    options.minimumFractionDigits !== undefined ||
    options.maximumFractionDigits !== undefined;

  const { maxDigits, minDigits } = (() => {
    if (hasCustomDigits) {
      return {
        minDigits: options.minimumFractionDigits,
        maxDigits: options.maximumFractionDigits,
      };
    }

    if (absAmount >= 1000) {
      return { minDigits: undefined, maxDigits: 0 };
    }
    if (absAmount >= 1) {
      return { minDigits: 2, maxDigits: 4 };
    }
    if (absAmount >= 0.01) {
      return { minDigits: undefined, maxDigits: 4 };
    }
    if (absAmount === 0) {
      return { minDigits: 2, maxDigits: undefined };
    }
    return { minDigits: 6, maxDigits: undefined };
  })();

  const formattedNumber = absAmount.toLocaleString("en-US", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
  });

  const sign = options?.withSign
    ? isNegative
      ? "-"
      : "+"
    : isNegative
      ? "-"
      : "";

  return `${sign}${symbol}${formattedNumber}`;
};

/**
 * Formats a percentage number: `12.345` -> `"12.35%"`
 */
export const formatPercentage = (
  percentage: number,
  options?: {
    maximumFractionDigits?: number;
  },
) => `${percentage.toFixed(options?.maximumFractionDigits ?? 2)}%`;

/**
 * Formats a rate string as a percentage.
 *
 * Example: `"0.0001"` -> `"0.01%"`
 */
export const formatRate = (
  rate: string,
  options?: {
    maximumFractionDigits?: number;
  },
) => formatPercentage(Number.parseFloat(rate) * 100, options);

/**
 * Returns a human-friendly USD amount using compact suffixes (K/M/B).
 *
 * - `1234` -> `$1.23K`
 * - `2_500_000` -> `$2.50M`
 *
 * For smaller values it falls back to `formatAmount`.
 */
export function formatCompactUsdAmount(volume: number): string {
  if (volume >= 1_000_000_000) {
    return `$${(volume / 1_000_000_000).toFixed(2)}B`;
  }
  if (volume >= 1_000_000) {
    return `$${(volume / 1_000_000).toFixed(2)}M`;
  }
  if (volume >= 1_000) {
    return `$${(volume / 1_000).toFixed(2)}K`;
  }
  return formatAmount(volume);
}

/**
 * Formats TP/SL settings for display.
 *
 * - Long: "TP +10%, SL -5%" or "TP Off, SL Off"
 * - Short: "TP -10%, SL +5%" or "TP Off, SL Off"
 */
export function formatTPOrSLSettings(settings: TPOrSLSettings) {
  const tp = Option.fromNullable(settings.takeProfit.percentage).pipe(
    Option.filter((percentage) => percentage !== 0),
    Option.map((percentage) => `TP ${formatPercentage(percentage)}`),
    Option.getOrElse(() => "TP Off"),
  );

  const sl = Option.fromNullable(settings.stopLoss.percentage).pipe(
    Option.filter((percentage) => percentage !== 0),
    Option.map((percentage) => `SL ${formatPercentage(percentage)}`),
    Option.getOrElse(() => "SL Off"),
  );

  return {
    tp,
    sl,
  };
}
