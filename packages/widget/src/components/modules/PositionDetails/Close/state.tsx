import { useAtomValue } from "@effect/atom-react";
import { positionsAtom } from "@yieldxyz/perps-common/atoms";
import type { WalletAccount } from "@yieldxyz/perps-common/domain";
import { type ApiTypes, runtimeAtom } from "@yieldxyz/perps-common/services";
import { Effect, Record } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";

export type { ApiTypes };

const closePositionAtom = Atom.family(
  (args: { walletAddress: WalletAccount["address"]; marketId: string }) =>
    runtimeAtom.atom(
      Effect.fn(function* (ctx) {
        const positions = yield* ctx.result(positionsAtom(args.walletAddress));

        const positionRef = Record.get(positions, args.marketId);

        if (positionRef._tag === "None") {
          return yield* Effect.die(new Error("Position not found"));
        }

        return positionRef.value.value;
      }),
    ),
);

export const usePosition = (
  walletAddress: WalletAccount["address"],
  marketId: string,
) => {
  return useAtomValue(closePositionAtom({ walletAddress, marketId }));
};
