import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { providersAtom, selectedProviderAtom } from "@/atoms/providers-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { ApiClientService } from "@/services/api-client";
import type { PortfolioRequestDto } from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

export const positionsAtom = Atom.family((params: PortfolioRequestDto) =>
  runtimeAtom
    .atom(
      Effect.gen(function* () {
        const client = yield* ApiClientService;

        return yield* client.PortfolioControllerGetPositions(params);
      }),
    )
    .pipe(Atom.keepAlive),
);

export const ordersAtom = Atom.family((params: PortfolioRequestDto) =>
  runtimeAtom
    .atom(
      Effect.gen(function* () {
        const client = yield* ApiClientService;

        return yield* client.PortfolioControllerGetOrders(params);
      }),
    )
    .pipe(Atom.keepAlive),
);

export const providersBalancesAtom = runtimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    const providers = yield* get.result(providersAtom);

    return yield* Effect.all(
      providers.map((provider) =>
        get.result(providerBalancesAtom(provider.id)),
      ),
      { concurrency: "unbounded" },
    );
  }),
);

export const providerBalancesAtom = Atom.family(
  (providerId: PortfolioRequestDto["providerId"]) =>
    runtimeAtom
      .atom(
        Effect.fn(function* (get) {
          const client = yield* ApiClientService;

          const {
            currentAccount: { address },
          } = yield* get.result(walletAtom);

          return yield* client.PortfolioControllerGetBalances({
            address,
            providerId,
          });
        }),
      )
      .pipe(Atom.keepAlive),
);

export const selectedProviderBalancesAtom = runtimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    const selectedProvider = yield* get.result(selectedProviderAtom);

    return yield* get.result(providerBalancesAtom(selectedProvider.id));
  }),
);
