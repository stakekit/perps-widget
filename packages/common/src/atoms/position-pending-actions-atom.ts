import { Registry, Result } from "@effect-atom/atom-react";
import { Effect } from "effect";
import type {
  TPOrSLOption,
  TPOrSLSettings,
} from "../components/molecules/tp-sl-dialog";
import type { WalletAccount, WalletConnected } from "../domain/wallet";
import { ApiClientService } from "../services/api-client";
import type { PositionDto } from "../services/api-client/api-schemas";
import { runtimeAtom } from "../services/runtime";
import { actionAtom } from "./actions-atoms";
import { tpSlArgument } from "./edit-position-atoms";
import { selectedProviderAtom } from "./providers-atoms";

export const editSLOrTPAtom = runtimeAtom.fn(
  Effect.fn(function* ({
    position,
    walletAddress,
    tpOrSLSettings,
    actionType,
  }: {
    position: PositionDto;
    walletAddress: WalletAccount["address"];
    tpOrSLSettings: TPOrSLSettings;
    actionType: TPOrSLOption;
  }) {
    const client = yield* ApiClientService;
    const registry = yield* Registry.AtomRegistry;

    const selectedProvider = registry
      .get(selectedProviderAtom)
      .pipe(Result.getOrElse(() => null));

    if (!selectedProvider) {
      return yield* Effect.dieMessage("No selected provider");
    }

    const newStopLossPrice = tpSlArgument(tpOrSLSettings.stopLoss);

    const newTakeProfitPrice = tpSlArgument(tpOrSLSettings.takeProfit);

    const action = yield* client.ActionsControllerExecuteAction({
      providerId: selectedProvider.id,
      address: walletAddress,
      action: actionType,
      args: {
        marketId: position.marketId,
        ...(actionType === "stopLoss"
          ? { stopLossPrice: newStopLossPrice }
          : { takeProfitPrice: newTakeProfitPrice }),
      },
    });

    registry.set(actionAtom, action);
  }),
);

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
