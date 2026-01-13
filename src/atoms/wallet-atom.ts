import { Atom, Result } from "@effect-atom/atom-react";
import { Data, Effect, Stream } from "effect";
import type { WalletAccount } from "@/domain/wallet";
import type { ActionDto } from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";
import { WalletService } from "@/services/wallet-service";

const initWalletAtom = runtimeAtom.atom(
  Effect.gen(function* () {
    const wallet = yield* WalletService;

    return wallet;
  }),
);

type WalletSuccess = Atom.Success<typeof initWalletAtom>;
type WalletError = Atom.Failure<typeof initWalletAtom> | InvalidAddressError;

type WalletAction = Data.TaggedEnum<{
  ChangeAccount: WalletAccount;
}>;
export const WalletAction = Data.taggedEnum<WalletAction>();

export const writableWalletAtom = Atom.writable<
  Result.Result<WalletSuccess, WalletError>,
  WalletAction
>(
  (ctx) => ctx.get(initWalletAtom),
  (ctx, action) => {
    const wallet = ctx.get(writableWalletAtom);

    if (!Result.isSuccess(wallet)) {
      return;
    }

    const update = WalletAction.$match(action, {
      ChangeAccount: (val) => {
        if (!wallet.value.accounts.some((a) => a.address === val.address)) {
          return Result.fail(new InvalidAddressError());
        }

        return Result.success({ ...wallet.value, currentAccount: val });
      },
    });

    ctx.setSelf(update);
  },
);

export const walletAtom = Atom.readable((get) => get(writableWalletAtom));

export const makeSignTransactionsAtom = (
  atom: Atom.Atom<Result.Result<ActionDto, never>>,
) => {
  return runtimeAtom.atom(
    Effect.fn(function* (ctx) {
      const action = yield* ctx.result(atom);
      const wallet = yield* ctx.result(initWalletAtom);

      const { startMachine, stream, state } = yield* wallet.signTransactions({
        account: wallet.currentAccount,
        action,
      });

      startMachine.pipe(Effect.runFork);

      stream.pipe(
        Stream.runForEach((val) =>
          Effect.sync(() => ctx.setSelf(Result.success(val))),
        ),
        Effect.runFork,
      );

      return state;
    }),
  );
};

export class InvalidAddressError extends Data.TaggedError(
  "InvalidAddressError",
) {}
