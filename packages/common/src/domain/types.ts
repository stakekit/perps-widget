import type { TokenDto } from "../services/api-client/api-schemas";

export type TokenString = `${TokenDto["network"]}-${TokenDto["address"]}`;

export type TokenPrices = Record<
  TokenString,
  { price: number; price_24_h: number }
>;

export type TokenBalance = {
  token: TokenDto;
  amount: string;
  price: number;
};
