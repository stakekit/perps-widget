import { Atom } from "@effect-atom/atom-react";
import { Duration, Effect } from "effect";
import type { WalletAccount } from "../domain/wallet";
import { ApiClientService } from "../services/api-client";
import { runtimeAtom, withReactivity } from "../services/runtime";
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

          return yield* client.PortfolioControllerGetPositions({
            address: walletAddress,
            providerId: selectedProvider.id,
          });
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
