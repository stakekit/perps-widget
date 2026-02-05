import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import {
  actionAtom,
  selectedProviderAtom,
  updateLeverageAtom,
} from "@yieldxyz/perps-common/atoms";
import type {
  TPOrSLOption,
  TPOrSLSettings,
} from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import {
  ApiClientService,
  ApiSchemas,
  type ApiTypes,
  runtimeAtom,
} from "@yieldxyz/perps-common/services";
import { Effect } from "effect";

export { ApiSchemas };

const editSLTPAtom = Atom.family((actionType: TPOrSLOption) =>
  runtimeAtom.fn(
    Effect.fn(function* ({
      position,
      wallet,
      tpOrSLSettings,
    }: {
      position: ApiTypes.PositionDto;
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

      const newStopLossPrice: ApiTypes.ArgumentsDto["stopLossPrice"] =
        tpOrSLSettings.stopLoss.triggerPrice &&
        tpOrSLSettings.stopLoss.option !== null
          ? tpOrSLSettings.stopLoss.triggerPrice
          : undefined;

      const newTakeProfitPrice: ApiTypes.ArgumentsDto["takeProfitPrice"] =
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
