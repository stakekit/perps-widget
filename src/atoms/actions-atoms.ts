import { Reactivity } from "@effect/experimental/Reactivity";
import { Atom } from "@effect-atom/atom-react";
import { Effect, Stream } from "effect";
import { portfolioReactivityKeysArray } from "@/atoms/portfolio-atoms";
import type { WalletConnected } from "@/domain/wallet";
import type { ActionDto } from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

export const actionAtom = Atom.writable<ActionDto | null, ActionDto>(
  () => null,
  (ctx, value) => ctx.setSelf(value),
);

const getActionAtom = Atom.make(
  Effect.fn(function* (ctx) {
    const action = ctx.get(actionAtom);
    if (!action) {
      return yield* Effect.dieMessage("No action found");
    }
    return action;
  }),
);

export const signActionAtoms = Atom.family(
  (signTransactions: WalletConnected["signTransactions"]) => {
    const machineAtom = runtimeAtom.atom((ctx) =>
      ctx
        .result(getActionAtom)
        .pipe(Effect.andThen((action) => signTransactions(action))),
    );

    const machineStreamAtom = runtimeAtom.atom((ctx) =>
      ctx.result(machineAtom).pipe(
        Effect.map((val) => val.stream),
        Stream.unwrap,
        Stream.takeUntil((v) => v.isDone),
        Stream.onDone(() =>
          Reactivity.pipe(
            Effect.andThen((reactivity) =>
              reactivity.invalidate(portfolioReactivityKeysArray),
            ),
          ),
        ),
      ),
    );

    const retryMachineAtom = runtimeAtom.fn((_, ctx) =>
      ctx.result(machineAtom).pipe(Effect.andThen((val) => val.retry)),
    );

    return {
      machineStreamAtom,
      retryMachineAtom,
    };
  },
);
