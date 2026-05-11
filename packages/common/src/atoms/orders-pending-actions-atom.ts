import { Effect } from "effect";
import * as Result from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";
import * as Registry from "effect/unstable/reactivity/AtomRegistry";
import type { WalletAccount } from "../domain/wallet";
import { ApiClientService } from "../services/api-client";
import { runtimeAtom } from "../services/runtime";
import { actionAtom } from "./actions-atoms";
import { selectedProviderAtom } from "./providers-atoms";

export const cancelOrderAtom = Atom.family((orderId: string) =>
  runtimeAtom.fn(
    Effect.fn(function* (args: {
      walletAddress: WalletAccount["address"];
      marketId: string;
    }) {
      const client = yield* ApiClientService;
      const registry = yield* Registry.AtomRegistry;

      const selectedProvider = registry
        .get(selectedProviderAtom)
        .pipe(Result.getOrElse(() => null));

      if (!selectedProvider) {
        return yield* Effect.die(new Error("No selected provider"));
      }

      const action = yield* client.ActionsControllerExecuteAction({
        payload: {
          providerId: selectedProvider.id,
          address: args.walletAddress,
          action: "cancelOrder",
          args: {
            orderId,
            marketId: args.marketId,
          },
        },
      });

      registry.set(actionAtom, action);
    }),
  ),
);
