import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import type { TokenString } from "../domain/types";
import type { TokenDto } from "../services/api-client/api-schemas";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getNetworkLogo = (network: string) =>
  `https://assets.stakek.it/networks/${network}.svg`;

export const getTokenLogo = (tokenSymbol: string) =>
  `https://assets.stakek.it/tokens/${tokenSymbol.toLowerCase()}.svg`;

export const getTokenString = (token: TokenDto): TokenString =>
  `${token.network}-${token.address}`;

export const truncateAddress = (address: string, length: number = 6) =>
  `${address.slice(0, length)}...${address.slice(-length)}`;

export const formatSnakeCase = (network: string) => {
  let str = network[0]?.toUpperCase() ?? "";
  for (let i = 1; i < network.length; i++) {
    str +=
      network[i] === "_" ? ` ${network[++i]?.toUpperCase() ?? ""}` : network[i];
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
