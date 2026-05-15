import { useAtomValue } from "@effect/atom-react";
import { positionsAtom } from "@yieldxyz/perps-common/atoms";
import {
  MarketId,
  type Position,
  type WalletAccount,
} from "@yieldxyz/perps-common/domain";
import { runtimeAtom } from "@yieldxyz/perps-common/services";
import { Effect, Record, Schema } from "effect";
import type * as Result from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";

const closePositionAtom = Atom.family(
  (args: { walletAddress: WalletAccount["address"]; marketId: string }) =>
    runtimeAtom.atom(
      Effect.fn(function* (ctx) {
        const positions = yield* ctx.result(positionsAtom(args.walletAddress));
        const marketId = Schema.decodeSync(MarketId)(args.marketId);

        const positionRef = Record.get(positions, marketId);

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
): Result.AsyncResult<Position, unknown> => {
  return useAtomValue(closePositionAtom({ walletAddress, marketId }));
};
