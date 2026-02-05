import { Atom, Registry } from "@effect-atom/atom-react";
import { Cause, Effect, Layer, Logger } from "effect";
import { ApiClientService } from "./api-client";
import { ConfigService } from "./config";
import { HttpClientService } from "./http-client";
import { BrowserSignerLayer } from "./wallet/browser-signer";
import { LedgerSignerLayer } from "./wallet/ledger-signer";
import { isLedgerDappBrowserProvider } from "./wallet/ledger-signer/utils";
import { WalletService } from "./wallet/wallet-service";

const Signer = isLedgerDappBrowserProvider
  ? LedgerSignerLayer.pipe(Layer.orDie)
  : BrowserSignerLayer.pipe(Layer.provide(ConfigService.Default)).pipe(
      Layer.orDie,
    );

const layer = Layer.mergeAll(
  WalletService.Default.pipe(Layer.provide(Signer)),
  ApiClientService.Default,
  HttpClientService.Default,
  ConfigService.Default,
  Registry.layer,
  Logger.pretty,
).pipe(
  Layer.tapErrorCause((cause) =>
    Effect.sync(() => {
      console.error(Cause.pretty(cause));
    }),
  ),
  Layer.orDie,
);

const memoMap = Layer.makeMemoMap.pipe(Effect.runSync);

const atomContext = Atom.context({ memoMap });

export const runtimeAtom = atomContext(layer);

/**
 * Use this instead of Atom.withReactivity to ensure the same Reactivity
 * service instance is used for both registering and invalidating keys.
 */
export const withReactivity = atomContext.withReactivity;
