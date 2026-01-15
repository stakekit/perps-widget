import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { signActionAtom } from "@/atoms/actions-atoms";
import { SignTransactions } from "@/components/modules/SignTransactions";
import { WalletProtectedRoute } from "@/components/molecules/navigation/wallet-protected-route";
import { Button } from "@/components/ui/button";
import type { WalletConnected } from "@/domain/wallet";

export function WithdrawSignRouteWithWallet({
  wallet,
}: {
  wallet: WalletConnected;
}) {
  const navigate = useNavigate();

  const machineAtoms = signActionAtom(wallet);

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-start gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: "/account/withdraw" })}
        >
          <ArrowLeft className="size-6 text-gray-2" />
        </Button>
        <p className="flex-1 font-semibold text-xl text-foreground tracking-[-0.6px]">
          Sign Withdrawal
        </p>
      </div>

      {/* Sign Transactions Component */}
      <SignTransactions machineAtoms={machineAtoms} />

      {/* Back to Account Button */}
      <div className="w-full mt-auto pt-6 flex">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => navigate({ to: "/account" })}
        >
          Back to Account
        </Button>
      </div>
    </div>
  );
}

export function WithdrawSignRoute() {
  return (
    <WalletProtectedRoute>
      {(wallet) => <WithdrawSignRouteWithWallet wallet={wallet} />}
    </WalletProtectedRoute>
  );
}
