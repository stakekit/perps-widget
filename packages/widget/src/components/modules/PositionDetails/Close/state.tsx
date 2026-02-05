import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import {
  actionAtom,
  positionsAtom,
  selectedProviderAtom,
} from "@yieldxyz/perps-common/atoms";
import type {
  WalletAccount,
  WalletConnected,
} from "@yieldxyz/perps-common/domain";
import { getCloseCalculations } from "@yieldxyz/perps-common/lib";
import {
  ApiClientService,
  type ApiTypes,
  runtimeAtom,
} from "@yieldxyz/perps-common/services";
import { Number as _Number, Data, Effect } from "effect";

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
  (args: { walletAddress: WalletAccount["address"]; marketId: string }) =>
    runtimeAtom.atom(
      Effect.fn(function* (ctx) {
        const positions = yield* ctx.result(positionsAtom(args.walletAddress));

        const position = positions.find((p) => p.marketId === args.marketId);

        if (!position) {
          return yield* Effect.dieMessage("Position not found");
        }

        return position;
      }),
    ),
);

export const usePosition = (
  walletAddress: WalletAccount["address"],
  marketId: string,
) => {
  return useAtomValue(
    closePositionAtom(Data.struct({ walletAddress, marketId })),
  );
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
