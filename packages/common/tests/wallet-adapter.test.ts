import { Effect, Layer, Schema, Stream } from "effect";
import { describe, expect, test } from "vitest";
import {
  type ExternalWalletSource,
  type PerpsWalletAdapter,
  type WalletAdapterState,
  WalletAddress,
  WalletMissingCapabilityError,
} from "../src/domain";
import { ExternalWalletAdapterLayer } from "../src/services/wallet/external-wallet-adapter";
import { WalletAdapterService } from "../src/services/wallet-adapter";

const accountA = Schema.decodeUnknownSync(WalletAddress)(
  "0x00000000000000000000000000000000000000a1",
);
const accountB = Schema.decodeUnknownSync(WalletAddress)(
  "0x00000000000000000000000000000000000000b2",
);

const disconnectedState: WalletAdapterState = { status: "disconnected" };

const connectedState = (currentAccount = accountA): WalletAdapterState => ({
  status: "connected",
  currentAccount: { address: currentAccount },
  accounts: [{ address: accountA }, { address: accountB }],
});

const makeBrowserAdapter = (): PerpsWalletAdapter => {
  const currentState = connectedState();

  return {
    mode: "browser",
    wagmiAdapter: {} as Extract<
      PerpsWalletAdapter,
      { mode: "browser" }
    >["wagmiAdapter"],
    getState: () => currentState,
    changes: Stream.succeed(currentState),
    sendTransaction: () => Effect.die(new Error("unused")),
    signTypedData: () => Effect.die(new Error("unused")),
    switchAccount: () => Effect.void,
    switchChain: () => Effect.void,
  };
};

const makeExternalAdapter = (initialState: WalletAdapterState) => {
  let state = initialState;
  const listeners = new Set<(state: WalletAdapterState) => void>();

  const adapter: ExternalWalletSource = {
    getState: () => state,
    subscribe: (listener) => {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    sendTransaction: () => Promise.reject(new Error("unused")),
    signTypedData: () => Promise.reject(new Error("unused")),
  };

  return {
    adapter,
    emit: (nextState: WalletAdapterState) => {
      state = nextState;

      for (const listener of listeners) {
        listener(nextState);
      }
    },
  };
};

describe("WalletAdapterService", () => {
  test("selects browser mode without an external source", () =>
    Effect.gen(function* () {
      const adapter = yield* WalletAdapterService;

      expect(adapter.mode).toBe("browser");
      expect(adapter.getState()).toMatchObject({
        status: "connected",
        currentAccount: { address: accountA },
      });
    }).pipe(
      Effect.provide(Layer.succeed(WalletAdapterService, makeBrowserAdapter())),
      Effect.runPromise,
    ));

  test("selects external mode when a host adapter is provided", () => {
    const external = makeExternalAdapter(connectedState(accountB));

    return Effect.gen(function* () {
      const adapter = yield* WalletAdapterService;

      expect(adapter.mode).toBe("external");
      expect(adapter.getState()).toMatchObject({
        status: "connected",
        currentAccount: { address: accountB },
      });
    }).pipe(
      Effect.provide(ExternalWalletAdapterLayer(external.adapter)),
      Effect.runPromise,
    );
  });

  test("updates state when the external adapter emits a change", () => {
    const external = makeExternalAdapter(disconnectedState);

    return Effect.gen(function* () {
      const adapter = yield* WalletAdapterService;

      expect(adapter.getState()).toEqual(disconnectedState);

      external.emit(connectedState(accountB));
      yield* Effect.yieldNow;

      expect(adapter.getState()).toMatchObject({
        status: "connected",
        currentAccount: { address: accountB },
      });
    }).pipe(
      Effect.provide(ExternalWalletAdapterLayer(external.adapter)),
      Effect.runPromise,
    );
  });

  test("returns typed missing capability errors for absent external account switching", () => {
    const external = makeExternalAdapter(connectedState());

    return Effect.gen(function* () {
      const adapter = yield* WalletAdapterService;
      const error = yield* adapter.switchAccount(accountA).pipe(Effect.flip);

      expect(error).toBeInstanceOf(WalletMissingCapabilityError);
      if (error._tag === "WalletMissingCapabilityError") {
        expect(error.capability).toBe("switchAccount");
      }
    }).pipe(
      Effect.provide(ExternalWalletAdapterLayer(external.adapter)),
      Effect.runPromise,
    );
  });
});
