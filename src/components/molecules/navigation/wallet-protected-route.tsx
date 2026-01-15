import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Navigate } from "@tanstack/react-router";
import { walletAtom } from "@/atoms/wallet-atom";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet";

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
