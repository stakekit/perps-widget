import {
  Atom,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { providersAtom } from "@yieldxyz/perps-common/atoms";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { Array as _Array, Option } from "effect";

const selectedProviderAtom = Atom.writable(
  (ctx) =>
    ctx
      .get(providersAtom)
      .pipe(Result.map(_Array.head), Result.map(Option.getOrNull)),
  (ctx, value: ApiTypes.ProviderDto) => ctx.setSelf(Result.success(value)),
);

export const useProviders = () => {
  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => null),
  );

  return {
    providers,
  };
};

export const useSelectedProvider = () => {
  const selectedProvider = useAtomValue(selectedProviderAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedProvider = useAtomSet(selectedProviderAtom);

  return {
    selectedProvider,
    setSelectedProvider,
  };
};
