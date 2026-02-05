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
import { getCloseCalculations } from "@yieldxyz/perps-common/lib";
import {
  ApiClientService,
  ApiSchemas,
  type ApiTypes,
  runtimeAtom,
} from "@yieldxyz/perps-common/services";
import { Number as _Number, Effect } from "effect";

export { ApiSchemas };

export const SLIDER_STOPS = [0, 25, 50, 75, 100];

const closePercentageAtom = Atom.writable<number, number>(
  () => 25,
  (ctx, value) =>
    ctx.setSelf(_Number.clamp({ minimum: 0, maximum: 100 })(value)),
);

export const useClosePercentage = () => {
  const closePercentage = useAtomValue(closePercentageAtom);
  const setClosePercentage = useAtomSet(closePercentageAtom);

  return {
    closePercentage,
    setClosePercentage,
  };
};

export const useCloseCalculations = (position: ApiTypes.PositionDto) => {
  const { closePercentage } = useClosePercentage();

  return getCloseCalculations(position, closePercentage);
};

const submitCloseAtom = runtimeAtom.fn(
  Effect.fn(function* (args: {
    position: ApiTypes.PositionDto;
    wallet: WalletConnected;
  }) {
    const client = yield* ApiClientService;
    const registry = yield* Registry.AtomRegistry;

    const selectedProvider = registry
      .get(selectedProviderAtom)
      .pipe(Result.getOrElse(() => null));

    if (!selectedProvider) {
      return yield* Effect.dieMessage("No selected provider");
    }

    const closePercentage = registry.get(closePercentageAtom);
    const closeCalculations =
      closePercentage === 100
        ? null
        : getCloseCalculations(args.position, closePercentage);

    const action = yield* client.ActionsControllerExecuteAction({
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
    });

    registry.set(actionAtom, action);
  }),
);

export const useSubmitClose = () => {
  const submitResult = useAtomValue(submitCloseAtom);
  const submitClose = useAtomSet(submitCloseAtom);

  return {
    submitResult,
    submitClose,
  };
};

// Leverage hooks
export const useUpdateLeverage = () => {
  const updateLeverageResult = useAtomValue(updateLeverageAtom);
  const updateLeverage = useAtomSet(updateLeverageAtom);

  return {
    updateLeverageResult,
    updateLeverage,
  };
};

// TP/SL hooks
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
