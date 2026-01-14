import { Effect } from "effect";
import { ConfigService } from "@/services/config";
import { runtimeAtom } from "@/services/runtime";

export const configAtom = runtimeAtom.atom(
  Effect.gen(function* () {
    const config = yield* ConfigService;

    return config;
  }),
);
