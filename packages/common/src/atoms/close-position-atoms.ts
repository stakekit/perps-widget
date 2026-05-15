import { Number as _Number, Effect } from "effect";
import * as Result from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as Registry from "effect/unstable/reactivity/AtomRegistry";
import type { Position } from "../domain";
import type { WalletConnected } from "../domain/wallet";
import { getCloseCalculations } from "../lib/math";
import { ApiClientService } from "../services/api-client";
import { runtimeAtom } from "../services/runtime";
import { actionAtom, decodeAction } from "./actions-atoms";
import { selectedProviderAtom } from "./providers-atoms";

export const SLIDER_STOPS = [0, 25, 50, 75, 100];

export const closePercentageAtom = Atom.writable<number, number>(
  () => 25,
  (ctx, value) =>
    ctx.setSelf(_Number.clamp({ minimum: 0, maximum: 100 })(value)),
);

export const submitCloseAtom = runtimeAtom.fn(
  Effect.fn(function* (args: { position: Position; wallet: WalletConnected }) {
    const client = yield* ApiClientService;
    const registry = yield* Registry.AtomRegistry;

    const selectedProvider = registry
      .get(selectedProviderAtom)
      .pipe(Result.getOrElse(() => null));

    if (!selectedProvider) {
      return yield* Effect.die(new Error("No selected provider"));
    }

    const closePercentage = registry.get(closePercentageAtom);
    const closeCalculations =
      closePercentage === 100
        ? null
        : getCloseCalculations(args.position, closePercentage);

    const action = yield* client.ActionsControllerExecuteAction({
      payload: {
        providerId: selectedProvider.id,
        address: args.wallet.currentAccount.address,
        action: "close",
        args: {
          marketId: args.position.marketId,
          side: args.position.side,
          ...(closeCalculations && {
            size: closeCalculations.closeSizeInMarketPrice,
          }),
        },
      },
    });

    registry.set(actionAtom, decodeAction(action));
  }),
);
