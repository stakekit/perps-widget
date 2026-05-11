import { Effect, Layer, Logger, ManagedRuntime } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as Registry from "effect/unstable/reactivity/AtomRegistry";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import { ApiClientService } from "./api-client";
import { ConfigService } from "./config";
import { HttpClientService } from "./http-client";
import { HyperliquidService } from "./hyperliquid";
import { BrowserSignerLayer } from "./wallet/browser-signer";
import { LedgerSignerLayer } from "./wallet/ledger-signer";
import { isLedgerDappBrowserProvider } from "./wallet/ledger-signer/utils";
import { WalletService } from "./wallet/wallet-service";

const Signer = isLedgerDappBrowserProvider
  ? LedgerSignerLayer.pipe(Layer.orDie)
  : BrowserSignerLayer.pipe(Layer.provide(ConfigService.layer), Layer.orDie);

const layer = Layer.mergeAll(
  WalletService.layer.pipe(Layer.provide(Signer)),
  ApiClientService.layer,
  HttpClientService.layer,
  ConfigService.layer,
  HyperliquidService.layer,
  Registry.layer,
  Reactivity.layer,
  Logger.layer([Logger.consolePretty()]),
).pipe(Layer.orDie);

const memoMap = Layer.makeMemoMap.pipe(Effect.runSync);

const atomContext = Atom.context({ memoMap });

export const runtimeAtom = atomContext(layer);

export const managedRuntime = ManagedRuntime.make(layer, { memoMap });

/**
 * Use this instead of Atom.withReactivity to ensure the same Reactivity
 * service instance is used for both registering and invalidating keys.
 */
export const withReactivity = atomContext.withReactivity;
