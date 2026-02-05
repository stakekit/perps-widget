import { Atom, useAtomValue } from "@effect-atom/atom-react";
import { positionsAtom } from "@yieldxyz/perps-common/atoms";
import type { WalletAccount } from "@yieldxyz/perps-common/domain";
import { type ApiTypes, runtimeAtom } from "@yieldxyz/perps-common/services";
import { Data, Effect } from "effect";

export type { ApiTypes };

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
