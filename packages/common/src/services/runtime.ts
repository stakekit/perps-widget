import { Effect, Layer, Logger } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as Registry from "effect/unstable/reactivity/AtomRegistry";
import { externalWalletSourceAtom } from "../atoms/external-wallet-source";
import { perpsConfigAtom } from "../atoms/perps-config-atom";
import type { ExternalWalletSource } from "../domain";
import { ApiClientService } from "./api-client";
import { ConfigService, type PerpsConfig } from "./config";
import { EventsService } from "./events";
import { HttpClientService } from "./http-client";
import { HyperliquidService } from "./hyperliquid";
import { BrowserWalletAdapterLayer } from "./wallet/browser-wallet-adapter";
import { ExternalWalletAdapterLayer } from "./wallet/external-wallet-adapter";

const makeConfigLayer = (config: PerpsConfig | null) =>
  Layer.effect(ConfigService)(
    Effect.gen(function* () {
      if (!config) {
        return yield* Effect.die(
          new Error("Perps config has not been provided"),
        );
      }

      return ConfigService.of(config);
    }),
  );

const baseLayer = Layer.mergeAll(
  ApiClientService.layer,
  HyperliquidService.layer,
  HttpClientService.layer,
  Registry.layer,
  EventsService.layer,
  Logger.layer([Logger.consolePretty()]),
);

const makeLayer = (
  externalSource: ExternalWalletSource | null,
  config: PerpsConfig | null,
) => {
  const configLayer = makeConfigLayer(config);

  const walletAdapterLayer = externalSource
    ? ExternalWalletAdapterLayer(externalSource)
    : BrowserWalletAdapterLayer;

  return Layer.mergeAll(baseLayer, walletAdapterLayer).pipe(
    Layer.provideMerge(configLayer),
    Layer.orDie,
  );
};

const memoMap = Layer.makeMemoMap.pipe(Effect.runSync);

const atomContext = Atom.context({ memoMap });

export const runtimeAtom = atomContext((get) =>
  makeLayer(get(externalWalletSourceAtom), get(perpsConfigAtom)),
);

/**
 * Use this instead of Atom.withReactivity to ensure the same Reactivity
 * service instance is used for both registering and invalidating keys.
 */
export const withReactivity = atomContext.withReactivity;
