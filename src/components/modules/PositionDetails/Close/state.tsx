import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Number as _Number, Data, Effect } from "effect";
import { actionAtom } from "@/atoms/actions-atoms";
import { positionsAtom } from "@/atoms/portfolio-atoms";
import { selectedProviderAtom } from "@/atoms/providers-atoms";
import { getCloseCalculations } from "@/domain/position";
import type { WalletConnected } from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import type { PositionDto } from "@/services/api-client/client-factory";
import { runtimeAtom } from "@/services/runtime";

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

const closePositionAtom = Atom.family(
  (args: { wallet: WalletConnected; marketId: string }) =>
    runtimeAtom.atom(
      Effect.fn(function* (ctx) {
        const positions = yield* ctx.result(positionsAtom(args.wallet));

        const position = positions.find((p) => p.marketId === args.marketId);

        if (!position) {
          return yield* Effect.dieMessage("Position not found");
        }

        return position;
      }),
    ),
);

export const usePosition = (wallet: WalletConnected, marketId: string) => {
  return useAtomValue(closePositionAtom(Data.struct({ wallet, marketId })));
};

export const useCloseCalculations = (position: PositionDto) => {
  const { closePercentage } = useClosePercentage();

  return getCloseCalculations(position, closePercentage);
};

const submitCloseAtom = runtimeAtom.fn(
  Effect.fn(function* (args: {
    position: PositionDto;
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
        ? null //
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
