import { Atom, Registry, Result } from "@effect-atom/atom-react";
import { Effect } from "effect";
import { actionAtom } from "@/atoms/actions-atoms";
import { selectedProviderAtom } from "@/atoms/providers-atoms";
import type { WalletConnected } from "@/domain/wallet";
import { ApiClientService } from "@/services/api-client";
import { runtimeAtom } from "@/services/runtime";

export const cancelOrderAtom = Atom.family((orderId: string) =>
  runtimeAtom.fn(
    Effect.fn(function* (args: { wallet: WalletConnected; marketId: string }) {
      const client = yield* ApiClientService;
      const registry = yield* Registry.AtomRegistry;

      const selectedProvider = registry
        .get(selectedProviderAtom)
        .pipe(Result.getOrElse(() => null));

      if (!selectedProvider) {
        return yield* Effect.dieMessage("No selected provider");
      }

      const action = yield* client.ActionsControllerExecuteAction({
        providerId: selectedProvider.id,
        address: args.wallet.currentAccount.address,
        action: "cancelOrder",
        args: {
          orderId,
          marketId: args.marketId,
        },
      });

      registry.set(actionAtom, action);
    }),
  ),
);
