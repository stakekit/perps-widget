import { Atom } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { makeSignTransactionsAtom } from "@/atoms/wallet-atom";
import type { ActionDto } from "@/services/api-client/api-schemas";

export const withdrawActionAtom = Atom.writable<ActionDto | null, ActionDto>(
  () => null,
  (ctx, value) => ctx.setSelf(value),
);

export const signWithdrawActionAtom = makeSignTransactionsAtom(
  Atom.make(
    Effect.fn(function* (ctx) {
      const action = ctx.get(withdrawActionAtom);
      if (!action) {
        return yield* Effect.dieMessage("No action found");
      }
      return action;
    }),
  ),
);
