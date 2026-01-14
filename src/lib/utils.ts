import { type ClassValue, clsx } from "clsx";
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

export const formatAmount = (
  amount: number | string,
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits: number;
  },
): string => {
  const amountNumber = typeof amount === "string" ? parseFloat(amount) : amount;

  if (options) {
    return `$${amountNumber.toLocaleString("en-US", {
      minimumFractionDigits: options.minimumFractionDigits,
      maximumFractionDigits: options.maximumFractionDigits,
    })}`;
  }

  if (amountNumber >= 1000) {
    return `$${amountNumber.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  }
  if (amountNumber >= 1) {
    return `$${amountNumber.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4,
    })}`;
  }
  if (amountNumber >= 0.01) {
    return `$${amountNumber.toLocaleString("en-US", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    })}`;
  }

  if (amountNumber === 0) {
    return "$0.00";
  }

  return `$${amountNumber.toLocaleString("en-US", {
    minimumFractionDigits: 6,
    maximumFractionDigits: 6,
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
