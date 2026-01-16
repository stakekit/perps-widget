import { Result } from "@effect-atom/atom-react";
import { Data, Effect, Stream } from "effect";
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

          return addressChange;
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

export class InvalidAddressError extends Data.TaggedError(
  "InvalidAddressError",
) {}
