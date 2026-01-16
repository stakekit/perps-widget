import { Reactivity } from "@effect/experimental/Reactivity";
import { Atom, Result } from "@effect-atom/atom-react";
import { Effect, Stream } from "effect";
import { portfolioReactivityKeysArray } from "@/atoms/portfolio-atoms";
import { providersReactivityKeysArray } from "@/atoms/providers-atoms";
import { tokensReactivityKeysArray } from "@/atoms/tokens-atoms";
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
    const machineAtom = runtimeAtom.atom(
      Effect.fn(function* (ctx) {
        const action = yield* ctx.result(getActionAtom);

        return yield* signTransactions(action);
      }),
    );

    const machineStreamAtom = runtimeAtom.atom(
      Effect.fn(function* (ctx) {
        const { state, stream, startMachine } = yield* ctx.result(machineAtom);

        const reactivity = yield* Reactivity;

        startMachine.pipe(Effect.runFork);

        stream.pipe(
          Stream.takeUntil((v) => v.isDone),
          Stream.onDone(() =>
            reactivity.invalidate([
              ...portfolioReactivityKeysArray,
              ...providersReactivityKeysArray,
              ...tokensReactivityKeysArray,
            ]),
          ),
          Stream.runForEach((val) =>
            Effect.sync(() => ctx.setSelf(Result.success(val))),
          ),
          Effect.runFork,
        );

        return state;
      }),
    );

    const retryMachineAtom = runtimeAtom.fn((_, ctx) =>
      Effect.gen(function* () {
        const { startMachine } = yield* ctx.result(machineAtom);

        return yield* startMachine;
      }),
    );

    return {
      machineStreamAtom,
      retryMachineAtom,
    };
  },
);
