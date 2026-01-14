import { Atom, Result } from "@effect-atom/atom-react";
import { Array as _Array, Effect } from "effect";
import { ApiClientService } from "@/services/api-client";
import type { ProviderDto } from "@/services/api-client/api-schemas";
import { runtimeAtom, withReactivity } from "@/services/runtime";

export const providersReactivityKeys = {
  providers: "providers",
} as const;

export const providersReactivityKeysArray = Object.values(
  providersReactivityKeys,
);

export const providersAtom = runtimeAtom
  .atom(
    Effect.gen(function* () {
      const client = yield* ApiClientService;

      return yield* client.ProvidersControllerGetProviders();
    }),
  )
  .pipe(withReactivity([providersReactivityKeys.providers]), Atom.keepAlive);

const initialProviderAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const providers = yield* ctx.resultOnce(providersAtom);

    return yield* _Array.head(providers);
  }),
);

export const selectedProviderAtom = Atom.writable(
  (ctx) => ctx.get(initialProviderAtom),
  (ctx, value: ProviderDto) => ctx.setSelf(Result.success(value)),
);
