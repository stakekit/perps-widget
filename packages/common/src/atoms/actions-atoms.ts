import { Reactivity } from "@effect/experimental/Reactivity";
import { Atom, type Result } from "@effect-atom/atom-react";
import { Effect, Stream } from "effect";
import type { SignTransactionsState, WalletConnected } from "../domain/wallet";
import type { ActionDto } from "../services/api-client/api-schemas";
import { runtimeAtom } from "../services/runtime";
import { portfolioReactivityKeysArray } from "./portfolio-atoms";

export const actionAtom = Atom.writable<ActionDto | null, ActionDto | null>(
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

type SignActionAtoms = (
  arg: (action: ActionDto) => Effect.Effect<
    {
      stream: Stream.Stream<SignTransactionsState, never, never>;
      retry: Effect.Effect<void, never, never>;
    },
    never,
    never
  >,
) => {
  machineStreamAtom: Atom.Atom<Result.Result<SignTransactionsState, never>>;
  retryMachineAtom: Atom.AtomResultFn<void, void, never>;
};

export const signActionAtoms: SignActionAtoms = Atom.family(
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
