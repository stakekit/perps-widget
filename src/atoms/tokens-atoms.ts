import {
  FetchHttpClient,
  HttpClient,
  HttpClientRequest,
  HttpClientResponse,
} from "@effect/platform";
import { Atom } from "@effect-atom/atom-react";
import { EvmNetworks } from "@stakekit/common";
import { Array as _Array, Effect, Option, pipe, Record, Schema } from "effect";
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

export const yieldApiNetworkToMoralisChain = {
  [EvmNetworks.Ethereum]: "eth",
  [EvmNetworks.Base]: "base",
  [EvmNetworks.Arbitrum]: "arbitrum",
  [EvmNetworks.Optimism]: "optimism",
  [EvmNetworks.Monad]: "monad",
} as const;

export type TokenBalances = Record<
  keyof typeof yieldApiNetworkToMoralisChain,
  TokenBalance[]
>;

export const moralisTokenBalancesAtom = Atom.family(
  (address: WalletConnected["currentAccount"]["address"]) =>
    runtimeAtom
      .atom(
        Effect.gen(function* () {
          const { moralisApiKey } = yield* ConfigService;
          const httpClient = yield* HttpClient.HttpClient.pipe(
            Effect.andThen((client) =>
              client.pipe(HttpClient.retryTransient({ times: 3 })),
            ),
            Effect.provide(FetchHttpClient.layer),
          );

          return yield* pipe(
            Record.toEntries(yieldApiNetworkToMoralisChain),
            (entries) =>
              entries.map(
                ([apiNetwork, moralisChain]) =>
                  [
                    apiNetwork,
                    httpClient
                      .execute(
                        HttpClientRequest.get(
                          `https://deep-index.moralis.io/api/v2.2/wallets/${address}/tokens`,
                        ).pipe(
                          HttpClientRequest.setUrlParam("chain", moralisChain),
                          HttpClientRequest.setUrlParam("exclude_spam", "true"),
                          HttpClientRequest.setUrlParam(
                            "exclude_unverified_contracts",
                            "true",
                          ),
                          HttpClientRequest.setHeaders({
                            accept: "application/json",
                            "X-API-Key": moralisApiKey,
                          }),
                        ),
                      )
                      .pipe(
                        Effect.andThen(
                          HttpClientResponse.schemaBodyJson(
                            MoralisTokenBalancesResponse,
                          ),
                        ),
                        Effect.map((response) =>
                          _Array.filterMap(response.result, (token) =>
                            !token.usd_price
                              ? Option.none()
                              : Option.some({
                                  price: token.usd_price,
                                  amount: token.balance_formatted,
                                  token: {
                                    decimals: token.decimals,
                                    name: token.name,
                                    network: apiNetwork,
                                    symbol: token.symbol,
                                    address: token.token_address,
                                    logoURI: token.logo ?? undefined,
                                  },
                                } as TokenBalance),
                          ),
                        ),
                      ),
                  ] as const,
              ),
            (val) =>
              Record.fromEntries(val) as Record<
                keyof typeof yieldApiNetworkToMoralisChain,
                (typeof val)[number][1]
              >,
            (record) =>
              Effect.all(record, { concurrency: "unbounded" }).pipe(
                Effect.ensureSuccessType<TokenBalances>(),
              ),
          );
        }),
      )
      .pipe(
        withReactivity([tokensReactivityKeys.moralisTokenBalances]),
        Atom.keepAlive,
      ),
);
