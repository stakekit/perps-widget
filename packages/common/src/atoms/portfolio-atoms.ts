import { Atom, AtomRef } from "@effect-atom/atom-react";
import { Duration, Effect, Record } from "effect";
import type { WalletAccount } from "../domain/wallet";
import { ApiClientService } from "../services/api-client";
import { runtimeAtom, withReactivity } from "../services/runtime";
import { midPriceAtom } from "./hyperliquid-atoms";
import { marketsBySymbolAtom } from "./markets-atoms";
import { providersAtom, selectedProviderAtom } from "./providers-atoms";
import { withRefreshAfter } from "./utils";

export const portfolioReactivityKeys = {
  positions: "positions",
  orders: "orders",
  providersBalances: "providersBalances",
  selectedProviderBalances: "selectedProviderBalances",
} as const;

export const portfolioReactivityKeysArray = Object.values(
  portfolioReactivityKeys,
);

export const positionsAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom
      .atom(
        Effect.fn(function* (ctx) {
          const client = yield* ApiClientService;
          const selectedProvider = yield* ctx.result(selectedProviderAtom);

          const positions = yield* client.PortfolioControllerGetPositions({
            address: walletAddress,
            providerId: selectedProvider.id,
          });

          return Record.fromIterableBy(
            positions.map((position) => AtomRef.make(position)),
            (ref) => ref.value.marketId,
          );
        }),
      )
      .pipe(
        withReactivity([portfolioReactivityKeys.positions]),
        withRefreshAfter(Duration.minutes(1)),
        Atom.keepAlive,
      ),
);

export const ordersAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom
      .atom(
        Effect.fn(function* (ctx) {
          const client = yield* ApiClientService;
          const selectedProvider = yield* ctx.result(selectedProviderAtom);

          return yield* client.PortfolioControllerGetOrders({
            address: walletAddress,
            providerId: selectedProvider.id,
          });
        }),
      )
      .pipe(
        withReactivity([portfolioReactivityKeys.orders]),
        withRefreshAfter(Duration.minutes(1)),
        Atom.keepAlive,
      ),
);

export const providersBalancesAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom
      .atom(
        Effect.fnUntraced(function* (get) {
          const providers = yield* get.result(providersAtom);
          const client = yield* ApiClientService;

          return yield* Effect.allSuccesses(
            providers.map((provider) =>
              client.PortfolioControllerGetBalances({
                address: walletAddress,
                providerId: provider.id,
              }),
            ),
            { concurrency: "unbounded" },
          );
        }),
      )
      .pipe(
        withReactivity([portfolioReactivityKeys.providersBalances]),
        withRefreshAfter(Duration.minutes(1)),
        Atom.keepAlive,
      ),
);

export const selectedProviderBalancesAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom
      .atom(
        Effect.fn(function* (ctx) {
          const selectedProvider = yield* ctx.result(selectedProviderAtom);
          const client = yield* ApiClientService;

          return yield* client.PortfolioControllerGetBalances({
            address: walletAddress,
            providerId: selectedProvider.id,
          });
        }),
      )
      .pipe(
        withReactivity([portfolioReactivityKeys.selectedProviderBalances]),
        withRefreshAfter(Duration.minutes(1)),
        Atom.keepAlive,
      ),
);

export const updatePositionsMidPriceAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom.atom((ctx) =>
      Effect.gen(function* () {
        const { mids } = yield* ctx.result(midPriceAtom);
        const markets = yield* ctx.result(marketsBySymbolAtom);
        const positions = yield* ctx.result(positionsAtom(walletAddress));

        Record.toEntries(mids).forEach(([symbol, price]) => {
          const marketRef = Record.get(markets, symbol);
          if (marketRef._tag === "None") return;

          const positionRef = Record.get(positions, marketRef.value.value.id);
          if (positionRef._tag === "None") return;

          positionRef.value.update((position) => ({
            ...position,
            markPrice: Number(price),
          }));
        });
      }),
    ),
);
