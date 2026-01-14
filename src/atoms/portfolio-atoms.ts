import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { providersAtom, selectedProviderAtom } from "@/atoms/providers-atoms";
import type { WalletConnected } from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import { runtimeAtom, withReactivity } from "@/services/runtime";

export const portfolioReactivityKeys = {
  positions: "positions",
  orders: "orders",
  providersBalances: "providersBalances",
  selectedProviderBalances: "selectedProviderBalances",
} as const;

export const portfolioReactivityKeysArray = Object.values(
  portfolioReactivityKeys,
);

export const positionsAtom = Atom.family((wallet: WalletConnected) =>
  runtimeAtom
    .atom(
      Effect.fn(function* (ctx) {
        const client = yield* ApiClientService;
        const selectedProvider = yield* ctx.result(selectedProviderAtom);

        return yield* client.PortfolioControllerGetPositions({
          address: wallet.currentAccount.address,
          providerId: selectedProvider.id,
        });
      }),
    )
    .pipe(withReactivity([portfolioReactivityKeys.positions]), Atom.keepAlive),
);

export const ordersAtom = Atom.family((wallet: WalletConnected) =>
  runtimeAtom
    .atom(
      Effect.fn(function* (ctx) {
        const client = yield* ApiClientService;
        const selectedProvider = yield* ctx.result(selectedProviderAtom);

        return yield* client.PortfolioControllerGetOrders({
          address: wallet.currentAccount.address,
          providerId: selectedProvider.id,
        });
      }),
    )
    .pipe(withReactivity([portfolioReactivityKeys.orders]), Atom.keepAlive),
);

export const providersBalancesAtom = Atom.family((wallet: WalletConnected) =>
  runtimeAtom
    .atom(
      Effect.fnUntraced(function* (get) {
        const providers = yield* get.result(providersAtom);
        const client = yield* ApiClientService;

        return yield* Effect.all(
          providers.map((provider) =>
            client.PortfolioControllerGetBalances({
              address: wallet.currentAccount.address,
              providerId: provider.id,
            }),
          ),
          { concurrency: "unbounded" },
        );
      }),
    )
    .pipe(
      withReactivity([portfolioReactivityKeys.providersBalances]),
      Atom.keepAlive,
    ),
);

export const selectedProviderBalancesAtom = Atom.family(
  (wallet: WalletConnected) =>
    runtimeAtom
      .atom(
        Effect.fn(function* (ctx) {
          const selectedProvider = yield* ctx.result(selectedProviderAtom);
          const client = yield* ApiClientService;

          return yield* client.PortfolioControllerGetBalances({
            address: wallet.currentAccount.address,
            providerId: selectedProvider.id,
          });
        }),
      )
      .pipe(
        withReactivity([portfolioReactivityKeys.selectedProviderBalances]),
        Atom.keepAlive,
      ),
);
