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

export const runtimeAtom = Atom.context({ memoMap })(layer);
