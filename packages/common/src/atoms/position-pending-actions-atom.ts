import { Effect } from "effect";
import * as Result from "effect/unstable/reactivity/AsyncResult";
import * as Registry from "effect/unstable/reactivity/AtomRegistry";
import type { Position } from "../domain";
import type { WalletConnected } from "../domain/wallet";
import { ApiClientService } from "../services/api-client";
import { runtimeAtom } from "../services/runtime";
import { actionAtom, decodeAction } from "./actions-atoms";
import { selectedProviderAtom } from "./providers-atoms";

export type UpdateMarginMode = "add" | "remove";

export const updateLeverageAtom = runtimeAtom.fn(
  Effect.fn(function* ({
    position,
    wallet,
    newLeverage,
  }: {
    position: Position;
    wallet: WalletConnected;
    newLeverage: number;
  }) {
    const client = yield* ApiClientService;
    const registry = yield* Registry.AtomRegistry;

    const selectedProvider = registry
      .get(selectedProviderAtom)
      .pipe(Result.getOrElse(() => null));

    if (!selectedProvider) {
      return yield* Effect.die(new Error("No selected provider"));
    }

    const action = yield* client.ActionsControllerExecuteAction({
      payload: {
        providerId: selectedProvider.id,
        address: wallet.currentAccount.address,
        action: "updateLeverage",
        args: {
          marketId: position.marketId,
          leverage: newLeverage,
          marginMode: "isolated",
        },
      },
    });

    registry.set(actionAtom, decodeAction(action));
  }),
);
