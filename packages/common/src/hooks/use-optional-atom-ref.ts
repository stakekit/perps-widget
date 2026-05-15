import type * as AtomRef from "effect/unstable/reactivity/AtomRef";
import React from "react";

export const useOptionalAtomRef = <A>(
  ref: AtomRef.ReadonlyRef<A> | null,
): A | null =>
  React.useSyncExternalStore(
    (onStoreChange) => {
      if (ref) {
        return ref.subscribe(onStoreChange);
      }

      return () => {};
    },
    () => ref?.value ?? null,
    () => ref?.value ?? null,
  );
