import { Schema } from "effect";
import * as Atom from "effect/unstable/reactivity/Atom";
import { Action } from "../domain";

export const decodeAction = Schema.decodeSync(Action);

export const actionAtom = Atom.make<Action | null>(null);
