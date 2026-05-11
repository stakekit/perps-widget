import { Effect, Stream } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import type {
  BrowserWalletConnected,
  LedgerWalletConnected,
} from "../domain/wallet";
import { runtimeAtom } from "../services/runtime";
import { WalletService } from "../services/wallet/wallet-service";

export const walletAtom = runtimeAtom.atom(
  Stream.unwrap(
    WalletService.use((ws) => Effect.succeed(ws.walletStream)),
  ).pipe(
    Stream.changesWith((a, b) => {
      if (a.status !== b.status) {
        return false;
      }

      if (a.status === "connected" && b.status === "connected") {
        const addressMatch =
          a.currentAccount.address === b.currentAccount.address;

        if (a.type === "ledger" && b.type === "ledger") {
          const aAccount = a.currentAccount;
          const bAccount = b.currentAccount;
          return addressMatch && aAccount.id === bAccount.id;
        }

        if (a.type === "browser") {
          return addressMatch;
        }
      }

      return true;
    }),
  ),
);

export const switchLedgerAccountAtom = Atom.family(
  (wallet: LedgerWalletConnected) => runtimeAtom.fn(wallet.switchAccount),
);

export const switchBrowserAccountAtom = Atom.family(
  (wallet: BrowserWalletConnected) => runtimeAtom.fn(wallet.switchAccount),
);
