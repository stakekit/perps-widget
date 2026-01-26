import { Atom } from "@effect-atom/atom-react";
import { Effect, Stream } from "effect";
import type { WalletConnected } from "@/domain/wallet";
import { runtimeAtom } from "@/services/runtime";
import { WalletService } from "@/services/wallet/wallet-service";

export const walletAtom = runtimeAtom.atom(
  WalletService.pipe(
    Effect.andThen((ws) => ws.walletStream),
    Stream.unwrap,
    Stream.changesWith((a, b) => {
      if (a.status !== b.status) {
        return false;
      }

      if (a.status === "connected" && b.status === "connected") {
        return a.currentAccount.id === b.currentAccount.id;
      }

      return true;
    }),
  ),
);

export const switchAccountAtom = Atom.family((wallet: WalletConnected) =>
  runtimeAtom.fn(wallet.switchAccount),
);
