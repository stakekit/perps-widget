import { Effect, FiberHandle, Layer, Schema, SubscriptionRef } from "effect";
import {
  type ExternalWalletSource,
  SignedPayload,
  TransactionHash,
  WalletAdapterState,
  WalletMissingCapabilityError,
  WalletSendTransactionError,
  WalletSignTypedDataError,
  WalletSwitchAccountError,
  WalletSwitchChainError,
} from "../../domain";
import { WalletAdapterService } from "../wallet-adapter";

export const ExternalWalletAdapterLayer = (source: ExternalWalletSource) =>
  Layer.effect(WalletAdapterService)(
    Effect.gen(function* () {
      const decodeState = Schema.decodeUnknownSync(WalletAdapterState);
      const stateRef = yield* SubscriptionRef.make(
        decodeState(source.getState()),
      );

      const run = yield* FiberHandle.makeRuntimePromise<never>();

      const unsubscribe = source.subscribe((state) => {
        run(SubscriptionRef.set(stateRef, decodeState(state)));
      });

      yield* Effect.addFinalizer(() => Effect.sync(unsubscribe));

      return WalletAdapterService.of({
        mode: "external",
        getState: () => stateRef.value,
        changes: SubscriptionRef.changes(stateRef),
        sendTransaction: (request) =>
          Effect.tryPromise(() => source.sendTransaction(request)).pipe(
            Effect.andThen(Schema.decodeUnknownEffect(TransactionHash)),
            Effect.mapError(
              (reason) => new WalletSendTransactionError({ reason }),
            ),
          ),
        signTypedData: (request) =>
          Effect.tryPromise(() => source.signTypedData(request)).pipe(
            Effect.andThen(Schema.decodeUnknownEffect(SignedPayload)),
            Effect.mapError(
              (reason) => new WalletSignTypedDataError({ reason }),
            ),
          ),
        switchAccount: (address) => {
          const switchExternalAccount = source.switchAccount;

          return switchExternalAccount
            ? Effect.tryPromise({
                try: () => switchExternalAccount(address),
                catch: (reason) => new WalletSwitchAccountError({ reason }),
              })
            : Effect.fail(
                new WalletMissingCapabilityError({
                  capability: "switchAccount",
                }),
              );
        },
        switchChain: (chainId) => {
          const switchExternalChain = source.switchChain;

          return switchExternalChain
            ? Effect.tryPromise({
                try: () => switchExternalChain(chainId),
                catch: (reason) => new WalletSwitchChainError({ reason }),
              })
            : Effect.fail(
                new WalletMissingCapabilityError({
                  capability: "switchChain",
                }),
              );
        },
      });
    }),
  );
