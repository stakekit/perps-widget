import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { walletAtom } from "@/atoms/wallet-atom";
import type { TokenPrices } from "@/domain/types";
import { ApiClientService } from "@/services/api-client";
import type { PriceRequestDto } from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

export const tokenBalancesAtom = runtimeAtom
  .atom(
    Effect.fn(function* (get) {
      const {
        currentAccount: { address },
      } = yield* get.result(walletAtom);

      const client = yield* ApiClientService;

      return yield* client.TokenControllerGetTokenBalances({
        payload: { addresses: [{ address, network: "ethereum" }] },
      });
    }),
  )
  .pipe(Atom.keepAlive);

export const tokenPricesAtom = Atom.family((payload: PriceRequestDto) =>
  runtimeAtom
    .atom(
      Effect.fn(function* () {
        const client = yield* ApiClientService;

        const res = yield* client.TokenControllerGetTokenPrices({ payload });

        return res as TokenPrices;
      }),
    )
    .pipe(Atom.keepAlive),
);
