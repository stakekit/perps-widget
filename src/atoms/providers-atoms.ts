import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { ApiClientService } from "@/services/api-client";
import { runtimeAtom } from "@/services/runtime";

export const providersAtom = runtimeAtom
  .atom(
    Effect.gen(function* () {
      const client = yield* ApiClientService;

      return yield* client.ProvidersControllerGetProviders();
    }),
  )
  .pipe(Atom.keepAlive);

export const selectedProviderAtom = runtimeAtom.atom(
  Effect.fnUntraced(function* (get) {
    const providers = yield* get.resultOnce(providersAtom);

    return providers[0];
  }),
);
