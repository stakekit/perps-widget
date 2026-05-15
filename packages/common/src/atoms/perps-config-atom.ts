import * as Atom from "effect/unstable/reactivity/Atom";
import type { PerpsConfig } from "../services/config";

export const perpsConfigAtom = Atom.make<PerpsConfig | null>(null);
