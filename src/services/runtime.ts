import { Atom, Registry } from "@effect-atom/atom-react";
import { Effect, Layer, Logger } from "effect";
import { ApiClientService } from "@/services/api-client";
import { ConfigService } from "@/services/config";
import { WalletService } from "@/services/wallet-service";

const layer = Layer.mergeAll(
  WalletService.Default.pipe(
    Layer.provideMerge(ApiClientService.Default),
    Layer.provideMerge(ConfigService.Default),
  ),
  Registry.layer,
  Logger.pretty,
);

const memoMap = Layer.makeMemoMap.pipe(Effect.runSync);

const atomContext = Atom.context({ memoMap });

export const runtimeAtom = atomContext(layer);

/**
 * Use this instead of Atom.withReactivity to ensure the same Reactivity
 * service instance is used for both registering and invalidating keys.
 */
export const withReactivity = atomContext.withReactivity;
