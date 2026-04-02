import type { AtomRef } from "@effect-atom/atom-react";
import React from "react";

export const useOptionalAtomRef = <A>(
  ref: AtomRef.ReadonlyRef<A> | null,
): A | null => {
  const [, setValue] = React.useState<A | null>(ref?.value ?? null);

  React.useEffect(() => {
    if (!ref) return;

    const sub = ref.subscribe((value) => {
      setValue(value);
    });

    return () => sub();
  }, [ref]);

  return ref?.value ?? null;
};
