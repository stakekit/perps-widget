import { Array as _Array, Data, Effect, Schema } from "effect";
import * as Result from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";
import { Provider } from "../domain";
import { ApiClientService } from "../services/api-client";
import { runtimeAtom, withReactivity } from "../services/runtime";

export const providersReactivityKeys = {
  providers: "providers",
} as const;

export const providersReactivityKeysArray = Object.values(
  providersReactivityKeys,
);

export const providersAtom = runtimeAtom
  .atom(
    ApiClientService.use((client) =>
      client
        .ProvidersControllerGetProviders(undefined)
        .pipe(Effect.andThen(Schema.decodeEffect(Schema.Array(Provider)))),
    ),
  )
  .pipe(withReactivity([providersReactivityKeys.providers]), Atom.keepAlive);

export class ProviderNotFoundError extends Data.TaggedError(
  "ProviderNotFoundError",
) {}

const initialProviderAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const providers = yield* ctx.resultOnce(providersAtom);

    const initialProvider = _Array.head(providers);

    if (initialProvider._tag === "None") {
      return yield* new ProviderNotFoundError();
    }

    return initialProvider.value;
  }),
);

export const selectedProviderAtom = Atom.writable(
  (ctx) => ctx.get(initialProviderAtom),
  (ctx, value: Provider) => ctx.setSelf(Result.success(value)),
).pipe(Atom.keepAlive);
