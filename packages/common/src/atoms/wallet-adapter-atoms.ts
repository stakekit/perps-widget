import { Effect, Option, Stream } from "effect";
import { AsyncResult, Atom } from "effect/unstable/reactivity";
import type { ChainId, WalletAddress } from "../domain";
import { WalletAdapterService } from "../services";
import { runtimeAtom } from "../services/runtime";

export const walletAdapterAtom = runtimeAtom.atom(
  Effect.gen(function* () {
    return yield* WalletAdapterService;
  }),
);

export const walletAdapterStateAtom = runtimeAtom.atom(
  Stream.unwrap(WalletAdapterService.useSync((service) => service.changes)),
);

export const walletAdapterModeAtom = Atom.make((context) => {
  const walletAdapter = context.get(walletAdapterAtom);

  return AsyncResult.value(walletAdapter).pipe(
    Option.map((adapter) => adapter.mode),
    Option.getOrElse(() => "browser" as const),
  );
});

export const switchWalletAdapterAccountAtom = runtimeAtom.fn(
  Effect.fn(function* (address: WalletAddress) {
    const walletAdapter = yield* WalletAdapterService;

    return yield* walletAdapter.switchAccount(address);
  }),
);

export const switchWalletAdapterChainAtom = runtimeAtom.fn(
  Effect.fn(function* (chainId: ChainId) {
    const walletAdapter = yield* WalletAdapterService;

    return yield* walletAdapter.switchChain(chainId);
  }),
);
