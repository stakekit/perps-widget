import * as Atom from "effect/unstable/reactivity/Atom";
import type { ExternalWalletSource } from "../domain";

export const externalWalletSourceAtom = Atom.make<ExternalWalletSource | null>(
  null,
);
