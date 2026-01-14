import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { makeSignTransactionsAtom } from "@/atoms/wallet-atom";
import type { WalletConnected } from "@/domain/wallet";
import type { ActionDto } from "@/services/api-client/api-schemas";

export const actionAtom = Atom.writable<ActionDto | null, ActionDto>(
  () => null,
  (ctx, value) => ctx.setSelf(value),
);

export const signActionAtom = Atom.family((wallet: WalletConnected) =>
  makeSignTransactionsAtom(
    Atom.make(
      Effect.fn(function* (ctx) {
        const action = ctx.get(actionAtom);
        if (!action) {
          return yield* Effect.dieMessage("No action found");
        }
        return { action, wallet };
      }),
    ),
  ),
);
