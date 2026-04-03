import { Registry, Result } from "@effect-atom/atom-react";
import { Effect, flow, Match, Option } from "effect";
import { defined } from "effect/Match";
import type {
  TPOrSLConfiguration,
  TPOrSLSettings,
} from "../components/molecules/tp-sl-dialog";
import type { WalletConnected } from "../domain/wallet";
import { ApiClientService } from "../services/api-client";
import type {
  ArgumentsDto,
  PositionDto,
} from "../services/api-client/api-schemas";
import { runtimeAtom } from "../services/runtime";
import { actionAtom } from "./actions-atoms";
import { selectedProviderAtom } from "./providers-atoms";

export const tpSlArgument = flow(
  Option.liftPredicate(
    (
      tpOrSL: TPOrSLConfiguration,
    ): tpOrSL is TPOrSLConfiguration & { triggerPrice: number } =>
      tpOrSL.triggerPrice !== null && tpOrSL.option !== null,
  ),
  Option.map((v) => v.triggerPrice),
  Option.getOrUndefined,
);

export const editSLTPAtom = runtimeAtom.fn(
  Effect.fn(function* ({
    position,
    wallet,
    tpOrSLSettings,
    stopLossOrderId,
    takeProfitOrderId,
  }: {
    position: PositionDto;
    wallet: WalletConnected;
    tpOrSLSettings: TPOrSLSettings;
    stopLossOrderId?: string;
    takeProfitOrderId?: string;
  }) {
    const client = yield* ApiClientService;
    const registry = yield* Registry.AtomRegistry;

    const selectedProvider = registry
      .get(selectedProviderAtom)
      .pipe(Result.getOrElse(() => null));

    if (!selectedProvider) {
      return yield* Effect.dieMessage("No selected provider");
    }

    const newStopLossPrice: ArgumentsDto["stopLossPrice"] = tpSlArgument(
      tpOrSLSettings.stopLoss,
    );

    const newTakeProfitPrice: ArgumentsDto["takeProfitPrice"] = tpSlArgument(
      tpOrSLSettings.takeProfit,
    );

    const actionArgs = Match.value({
      newStopLossPrice,
      newTakeProfitPrice,
    }).pipe(
      Match.withReturnType<{
        action: "setTpAndSl" | "takeProfit" | "stopLoss";
        args: ArgumentsDto;
      } | null>(),
      Match.when(
        { newStopLossPrice: defined, newTakeProfitPrice: defined },
        (v) => ({
          action: "setTpAndSl",
          args: {
            stopLossPrice: v.newStopLossPrice,
            takeProfitPrice: v.newTakeProfitPrice,
            ...(stopLossOrderId && { stopLossOrderId }),
            ...(takeProfitOrderId && { takeProfitOrderId }),
          },
        }),
      ),
      Match.when({ newTakeProfitPrice: defined }, () => ({
        action: "takeProfit",
        args: {
          takeProfitPrice: newTakeProfitPrice,
          ...(takeProfitOrderId && { orderId: takeProfitOrderId }),
        },
      })),
      Match.when({ newStopLossPrice: defined }, () => ({
        action: "stopLoss",
        args: {
          stopLossPrice: newStopLossPrice,
          ...(stopLossOrderId && { orderId: stopLossOrderId }),
        },
      })),
      Match.orElse(() => null),
    );

    if (!actionArgs) {
      return yield* Effect.dieMessage("No TP/SL settings provided");
    }

    const action = yield* client.ActionsControllerExecuteAction({
      providerId: selectedProvider.id,
      address: wallet.currentAccount.address,
      action: actionArgs.action,
      args: {
        marketId: position.marketId,
        ...actionArgs.args,
      },
    });

    registry.set(actionAtom, action);
  }),
);
