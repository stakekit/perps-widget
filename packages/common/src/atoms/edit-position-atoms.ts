import { Atom, Registry, Result } from "@effect-atom/atom-react";
import { Effect, Option } from "effect";
import type {
  TPOrSLConfiguration,
  TPOrSLOption,
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

export const tpSlArgument = (tpOrSL: TPOrSLConfiguration) =>
  Option.some(tpOrSL).pipe(
    Option.filterMap((v) =>
      v.triggerPrice !== null && v.option !== null
        ? Option.some(v.triggerPrice)
        : Option.none(),
    ),
    Option.getOrUndefined,
  );

export const editSLTPAtom = Atom.family((actionType: TPOrSLOption) =>
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

      const newStopLossPrice: ArgumentsDto["stopLossPrice"] = tpSlArgument(
        tpOrSLSettings.stopLoss,
      );

      const newTakeProfitPrice: ArgumentsDto["takeProfitPrice"] = tpSlArgument(
        tpOrSLSettings.takeProfit,
      );

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
