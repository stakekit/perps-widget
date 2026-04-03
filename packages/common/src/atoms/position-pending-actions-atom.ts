import { Registry, Result } from "@effect-atom/atom-react";
import { Effect } from "effect";
import type { WalletConnected } from "../domain/wallet";
import { ApiClientService } from "../services/api-client";
import type { PositionDto } from "../services/api-client/api-schemas";
import { runtimeAtom } from "../services/runtime";
import { actionAtom } from "./actions-atoms";
import { selectedProviderAtom } from "./providers-atoms";

export type UpdateMarginMode = "add" | "remove";

export const updateLeverageAtom = runtimeAtom.fn(
  Effect.fn(function* ({
    position,
    wallet,
    newLeverage,
  }: {
    position: PositionDto;
    wallet: WalletConnected;
    newLeverage: number;
  }) {
    const client = yield* ApiClientService;
    const registry = yield* Registry.AtomRegistry;

    const selectedProvider = registry
      .get(selectedProviderAtom)
      .pipe(Result.getOrElse(() => null));

    if (!selectedProvider) {
      return yield* Effect.dieMessage("No selected provider");
    }

    const action = yield* client.ActionsControllerExecuteAction({
      providerId: selectedProvider.id,
      address: wallet.currentAccount.address,
      action: "updateLeverage",
      args: {
        marketId: position.marketId,
        leverage: newLeverage,
        marginMode: "isolated",
      },
    });

    registry.set(actionAtom, action);
  }),
);
