import { type Cause, Effect, Stream } from "effect";
import type * as Result from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as Reactivity from "effect/unstable/reactivity/Reactivity";
import type { SignTransactionsState, WalletConnected } from "../domain/wallet";
import type { ActionDto } from "../services/api-client/client-factory";
import { runtimeAtom } from "../services/runtime";
import { portfolioReactivityKeysArray } from "./portfolio-atoms";

export const actionAtom = Atom.make<ActionDto | null>(null);

const getActionAtom = Atom.make(
  Effect.fn(function* (ctx) {
    const action = ctx.get(actionAtom);
    if (!action) {
      return yield* Effect.die(new Error("No action found"));
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
  machineStreamAtom: Atom.Atom<
    Result.AsyncResult<SignTransactionsState, Cause.NoSuchElementError>
  >;
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
        Stream.ensuring(Reactivity.invalidate(portfolioReactivityKeysArray)),
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
