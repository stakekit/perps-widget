import { useAtomSet, useAtomValue } from "@effect/atom-react";
import { providersAtom } from "@yieldxyz/perps-common/atoms";
import type { Provider } from "@yieldxyz/perps-common/domain";
import { Array as _Array, Option } from "effect";
import * as Result from "effect/unstable/reactivity/AsyncResult";
import * as Atom from "effect/unstable/reactivity/Atom";

const selectedProviderAtom = Atom.writable(
  (ctx) =>
    ctx
      .get(providersAtom)
      .pipe(Result.map(_Array.head), Result.map(Option.getOrNull)),
  (ctx, value: Provider) => ctx.setSelf(Result.success(value)),
);

export const useProviders = () => {
  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => null),
  );

  return {
    providers,
  };
};

export const useSelectedProvider = (): {
  selectedProvider: Provider | null;
  setSelectedProvider: (value: Provider) => void;
} => {
  const selectedProvider = useAtomValue(selectedProviderAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedProvider = useAtomSet(selectedProviderAtom);

  return {
    selectedProvider,
    setSelectedProvider,
  };
};
