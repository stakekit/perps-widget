import type { TokenInfo } from "./token";

export type TokenData = TokenInfo;

export type TokenString = `${TokenData["network"]}-${string}`;

export type TokenPrices = Record<
  TokenString,
  { price: number; price_24_h: number }
>;

export type TokenBalance = {
  token: TokenData;
  amount: string;
  price: number;
};
