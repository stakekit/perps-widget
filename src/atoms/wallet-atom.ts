import { Reactivity } from "@effect/experimental/Reactivity";
import { Atom, Result } from "@effect-atom/atom-react";
import { Data, Effect, Stream } from "effect";
import { portfolioReactivityKeysArray } from "@/atoms/portfolio-atoms";
import { providersReactivityKeysArray } from "@/atoms/providers-atoms";
import { tokensReactivityKeysArray } from "@/atoms/tokens-atoms";
import type { WalletAccount, WalletConnected } from "@/domain/wallet";
import type { ActionDto } from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";
import { WalletService } from "@/services/wallet-service";

export const walletAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const { walletStream } = yield* WalletService;

    const broadcasted = yield* Stream.broadcastDynamic(walletStream, {
      capacity: "unbounded",
    });

    const broadcastedWithChanges = broadcasted.pipe(
      Stream.changesWith((a, b) => {
        if (a.status !== b.status) {
          return false;
        }

        if (a.status === "connected" && b.status === "connected") {
          const addressChange =
            a.currentAccount.address === b.currentAccount.address;
          const chainChange = a.currentAccount.chain === b.currentAccount.chain;

          return addressChange && chainChange;
        }

        return true;
      }),
    );

    broadcastedWithChanges.pipe(
      Stream.runForEach((val) =>
        Effect.sync(() => ctx.setSelf(Result.success(val))),
      ),
      Effect.runFork,
    );

    return yield* broadcastedWithChanges.pipe(
      Stream.take(1),
      Stream.runHead,
      Effect.flatten,
      Effect.orDie,
    );
  }),
);

export const changeAccountAtom = Atom.family((wallet: WalletConnected) =>
  runtimeAtom.fn((account: WalletAccount) => wallet.switchAccount(account)),
);

export const makeSignTransactionsAtom = (
  atom: Atom.Atom<
    Result.Result<{ action: ActionDto; wallet: WalletConnected }, never>
  >,
) => {
  const machineAtom = runtimeAtom.atom(
    Effect.fn(function* (ctx) {
      const { action, wallet } = yield* ctx.result(atom);

      return yield* wallet.signTransactions({
        account: wallet.currentAccount,
        action,
      });
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
};

export class InvalidAddressError extends Data.TaggedError(
  "InvalidAddressError",
) {}
