import {
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Effect } from "effect";
import { actionAtom } from "@/atoms/actions-atoms";
import { selectedProviderAtom } from "@/atoms/providers-atoms";
import type { TPOrSLSettings } from "@/components/molecules/tp-sl-dialog";
import type { WalletConnected } from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import type {
  ArgumentsDto,
  PositionDto,
} from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

const editSLTPAtom = runtimeAtom.fn(
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
      // @ts-expect-error
      action: "updateTpsl",
      args: {
        marketId: position.marketId,
        // @ts-expect-error
        stopLossPrice: newStopLossPrice || null,
        // @ts-expect-error
        takeProfitPrice: newTakeProfitPrice || null,
      },
    });

    registry.set(actionAtom, action);
  }),
);

export const useEditSLTP = () => {
  const editSLTPResult = useAtomValue(editSLTPAtom);
  const editSLTP = useAtomSet(editSLTPAtom);

  return {
    editSLTPResult,
    editSLTP,
  };
};
