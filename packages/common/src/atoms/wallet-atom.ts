import { Stream } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import type { Wallet, WalletConnected } from "../domain/wallet";
import type {
  PerpsWalletAdapter,
  WalletAdapterState,
} from "../domain/wallet-adapter";
import { runtimeAtom } from "../services/runtime";
import { WalletAdapterService } from "../services/wallet-adapter";

const makeWallet = (
  adapter: PerpsWalletAdapter,
  state: WalletAdapterState,
): Wallet => {
  if (state.status === "disconnected") {
    return {
      type: adapter.mode,
      status: "disconnected",
    };
  }

  return {
    type: adapter.mode,
    status: "connected",
    currentAccount: state.currentAccount,
    accounts: state.accounts,
    switchAccount: ({ account }) => adapter.switchAccount(account.address),
  };
};

const accountsAreEqual = (
  a: WalletConnected["accounts"],
  b: WalletConnected["accounts"],
) =>
  a.length === b.length &&
  a.every((account, index) => {
    const other = b[index];

    return (
      other &&
      account.address === other.address &&
      account.id === other.id &&
      account.label === other.label
    );
  });

export const walletAtom = runtimeAtom.atom(
  Stream.unwrap(
    WalletAdapterService.useSync((adapter) =>
      adapter.changes.pipe(Stream.map((state) => makeWallet(adapter, state))),
    ),
  ).pipe(
    Stream.changesWith((a, b) => {
      if (a.type !== b.type || a.status !== b.status) {
        return false;
      }

      if (a.status === "connected" && b.status === "connected") {
        return (
          a.currentAccount.address === b.currentAccount.address &&
          a.currentAccount.id === b.currentAccount.id &&
          a.currentAccount.label === b.currentAccount.label &&
          accountsAreEqual(a.accounts, b.accounts)
        );
      }

      return true;
    }),
  ),
);

export const switchWalletAccountAtom = Atom.family((wallet: WalletConnected) =>
  runtimeAtom.fn(wallet.switchAccount),
);
