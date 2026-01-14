import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Atom } from "@effect-atom/atom-react";
import { EvmNetworks } from "@stakekit/common";
import { Effect, Schema } from "effect";
import type { TokenBalance } from "@/domain/types";
import type { WalletConnected } from "@/domain/wallet";
import { ConfigService } from "@/services/config";
import { runtimeAtom, withReactivity } from "@/services/runtime";

export const tokensReactivityKeys = {
  tokenBalances: "tokenBalances",
  tokenPrices: "tokenPrices",
  moralisTokenBalances: "moralisTokenBalances",
} as const;

export const tokensReactivityKeysArray = Object.values(tokensReactivityKeys);

// Moralis API response types
export const MoralisTokenBalance = Schema.Struct({
  token_address: Schema.String,
  symbol: Schema.String,
  name: Schema.String,
  logo: Schema.NullOr(Schema.String),
  thumbnail: Schema.NullOr(Schema.String),
  decimals: Schema.Number,
  balance: Schema.String,
  possible_spam: Schema.Boolean,
  verified_contract: Schema.Boolean,
  total_supply: Schema.NullOr(Schema.String),
  total_supply_formatted: Schema.NullOr(Schema.String),
  percentage_relative_to_total_supply: Schema.NullOr(Schema.Number),
  security_score: Schema.NullOr(Schema.Number),
  balance_formatted: Schema.String,
  usd_price: Schema.NullOr(Schema.Number),
  usd_price_24hr_percent_change: Schema.NullOr(Schema.Number),
  usd_price_24hr_usd_change: Schema.NullOr(Schema.Number),
  usd_value: Schema.NullOr(Schema.Number),
  usd_value_24hr_usd_change: Schema.NullOr(Schema.Number),
  native_token: Schema.Boolean,
  portfolio_percentage: Schema.Number,
});

export type MoralisTokenBalance = typeof MoralisTokenBalance.Type;

export const MoralisTokenBalancesResponse = Schema.Struct({
  cursor: Schema.NullOr(Schema.String),
  page: Schema.Number,
  page_size: Schema.Number,
  block_number: Schema.Number,
  result: Schema.Array(MoralisTokenBalance),
});

export type MoralisTokenBalancesResponse =
  typeof MoralisTokenBalancesResponse.Type;

export const moralisTokenBalancesAtom = Atom.family(
  (address: WalletConnected["currentAccount"]["address"]) =>
    runtimeAtom
      .atom(
        Effect.gen(function* () {
          const { moralisApiKey } = yield* ConfigService;
          const httpClient = yield* HttpClient.HttpClient.pipe(
            Effect.provide(FetchHttpClient.layer),
          );

          const response = yield* httpClient.execute(
            HttpClientRequest.get(
              `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens`,
            ).pipe(
              HttpClientRequest.setHeaders({
                accept: "application/json",
                "X-API-Key": moralisApiKey,
              }),
            ),
          );

          const json = yield* HttpClientResponse.schemaBodyJson(
            MoralisTokenBalancesResponse,
          )(response);

          return json.result.map(
            (token): TokenBalance => ({
              price: token.usd_price,
              amount: token.balance_formatted,
              token: {
                decimals: token.decimals,
                name: token.name,
                network: EvmNetworks.Ethereum,
                symbol: token.symbol,
                address: token.token_address,
                logoURI: token.logo ?? undefined,
              },
            }),
          );
        }),
      )
      .pipe(
        withReactivity([tokensReactivityKeys.moralisTokenBalances]),
        Atom.keepAlive,
      ),
);
