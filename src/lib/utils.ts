import { type ClassValue, clsx } from "clsx";
import { Match } from "effect";
import { twMerge } from "tailwind-merge";
import type { TokenString } from "@/domain/types";
import type { Networks, TokenDto } from "@/services/api-client/api-schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getNetworkLogo = (network: typeof Networks.Type) =>
  `https://assets.stakek.it/networks/${network}.svg`;

export const getTokenLogo = (tokenSymbol: string) =>
  `https://assets.stakek.it/tokens/${tokenSymbol.toLowerCase()}.svg`;

const tokenAmountFormatter = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 5,
});

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

export const formatAmount = (
  amount: number | string,
  options = { symbol: "$" } as {
    minimumFractionDigits?: number;
    maximumFractionDigits: number;
    withSign?: boolean;
    symbol?: string | null;
  },
): string => {
  const amountNumber = typeof amount === "string" ? parseFloat(amount) : amount;

  const symbol = options.symbol !== null ? (options.symbol ?? "$") : "";

  const { maxDigits, minDigits } = Match.value({ amountNumber, options }).pipe(
    Match.withReturnType<{
      minDigits: number | undefined;
      maxDigits: number | undefined;
    }>(),
    Match.when({ options: Match.defined }, (v) => ({
      minDigits: v.options.minimumFractionDigits,
      maxDigits: v.options.maximumFractionDigits,
    })),
    Match.when(
      ({ amountNumber }) => amountNumber >= 1000,
      () => ({ minDigits: undefined, maxDigits: 0 }),
    ),
    Match.when(
      ({ amountNumber }) => amountNumber >= 1,
      () => ({ minDigits: 2, maxDigits: 4 }),
    ),
    Match.when(
      ({ amountNumber }) => amountNumber >= 0.01,
      () => ({ minDigits: undefined, maxDigits: 4 }),
    ),
    Match.when(
      ({ amountNumber }) => amountNumber === 0,
      () => ({ minDigits: 2, maxDigits: undefined }),
    ),
    Match.orElse(() => ({ minDigits: 6, maxDigits: undefined })),
  );

  return `${symbol}${amountNumber.toLocaleString("en-US", {
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
    signDisplay: options?.withSign ? "always" : "auto",
  })}`;
};

export const formatPercentage = (
  percentage: number,
  options?: {
    maximumFractionDigits?: number;
  },
) => {
  return `${percentage.toFixed(options?.maximumFractionDigits ?? 2)}%`;
};

export const formatRate = (
  rate: string,
  options?: {
    maximumFractionDigits?: number;
  },
) => {
  return formatPercentage(Number.parseFloat(rate) * 100, options);
};

export const getTokenString = (token: TokenDto): TokenString =>
  `${token.network}-${token.address}`;

export const truncateAddress = (address: string, length: number = 6) =>
  `${address.slice(0, length)}...${address.slice(-length)}`;

export const formatSnakeCase = (network: string) => {
  let str = network[0].toUpperCase();
  for (let i = 1; i < network.length; i++) {
    str += network[i] === "_" ? ` ${network[++i].toUpperCase()}` : network[i];
  }
  return str;
};

export const formatDate = (timestamp: number): string => {
  const date = new Date(timestamp);
  return date.toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};

export const truncateNumber = (number: number, precision: number = 2) => {
  return Math.floor(number * 10 ** precision) / 10 ** precision;
};
