import { Stream } from "effect";
import { EventsService } from "../services/events";
import { runtimeAtom } from "../services/runtime";

export const lifecycleEventAtom = runtimeAtom.atom(
  Stream.unwrap(EventsService.useSync((service) => service.stream)),
);
