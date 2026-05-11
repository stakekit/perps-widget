import { useAtomValue } from "@effect/atom-react";
import { Navigate } from "@tanstack/react-router";
import { walletAtom } from "@yieldxyz/perps-common/atoms";
import {
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import * as Result from "effect/unstable/reactivity/AsyncResult";

export const WalletProtectedRoute = ({
  children,
}: {
  children: (wallet: WalletConnected) => React.ReactNode;
}) => {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  if (!isWalletConnected(wallet)) {
    return <Navigate to="/" />;
  }

  return children(wallet);
};
