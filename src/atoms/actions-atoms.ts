import { Effect } from "effect";
import { ApiClientService } from "@/services/api-client";
import type { ActionRequestDto } from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

export const executeActionResultAtom = runtimeAtom.fn(
  Effect.fn(function* (args: ActionRequestDto) {
    const client = yield* ApiClientService;

    return yield* client.ActionsControllerExecuteAction(args);
  }),
);

export const actionAtom = runtimeAtom.fn(
  Effect.fn(function* (actionId: string) {
    const client = yield* ApiClientService;

    return yield* client.ActionsControllerGetAction(actionId);
  }),
);
