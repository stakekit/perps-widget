import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Effect } from "effect";
import { actionAtom } from "@/atoms/actions-atoms";
import { updateLeverageAtom } from "@/atoms/position-pending-actions-atom";
import { selectedProviderAtom } from "@/atoms/providers-atoms";
import type {
  TPOrSLOption,
  TPOrSLSettings,
} from "@/components/molecules/tp-sl-dialog";
import type { WalletConnected } from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import type {
  ArgumentsDto,
  PositionDto,
} from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

const editSLTPAtom = Atom.family((actionType: TPOrSLOption) =>
  runtimeAtom.fn(
    Effect.fn(function* ({
      position,
      wallet,
      tpOrSLSettings,
    }: {
      position: PositionDto;
      wallet: WalletConnected;
      tpOrSLSettings: TPOrSLSettings;
    }) {
      const client = yield* ApiClientService;
      const registry = yield* Registry.AtomRegistry;

      const selectedProvider = registry
        .get(selectedProviderAtom)
        .pipe(Result.getOrElse(() => null));

      if (!selectedProvider) {
        return yield* Effect.dieMessage("No selected provider");
      }

      const newStopLossPrice: ArgumentsDto["stopLossPrice"] =
        tpOrSLSettings.stopLoss.triggerPrice &&
        tpOrSLSettings.stopLoss.option !== null
          ? tpOrSLSettings.stopLoss.triggerPrice
          : undefined;

      const newTakeProfitPrice: ArgumentsDto["takeProfitPrice"] =
        tpOrSLSettings.takeProfit.triggerPrice &&
        tpOrSLSettings.takeProfit.option !== null
          ? tpOrSLSettings.takeProfit.triggerPrice
          : undefined;

      const action = yield* client.ActionsControllerExecuteAction({
        providerId: selectedProvider.id,
        address: wallet.currentAccount.address,
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
  ),
);

export const useEditSLTP = () => {
  const editTPResult = useAtomValue(editSLTPAtom("takeProfit"));
  const editTP = useAtomSet(editSLTPAtom("takeProfit"));

  const editSLResult = useAtomValue(editSLTPAtom("stopLoss"));
  const editSL = useAtomSet(editSLTPAtom("stopLoss"));

  return {
    editTPResult,
    editTP,
    editSLResult,
    editSL,
  };
};

export const useUpdateLeverage = () => {
  const updateLeverageResult = useAtomValue(updateLeverageAtom);
  const updateLeverage = useAtomSet(updateLeverageAtom);

  return {
    updateLeverageResult,
    updateLeverage,
  };
};
