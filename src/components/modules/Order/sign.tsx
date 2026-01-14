import { useNavigate, useParams } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { signActionAtom } from "@/atoms/actions-atoms";
import { SignTransactions } from "@/components/modules/SignTransactions";
import { WalletProtectedRoute } from "@/components/molecules/navigation/wallet-protected-route";
import { Button } from "@/components/ui/button";
import type { WalletConnected } from "@/domain/wallet";

export function OrderSignRouteWithWallet({
  wallet,
}: {
  wallet: WalletConnected;
}) {
  const navigate = useNavigate();
  const { marketId, side } = useParams({
    from: "/order/$marketId/$side/sign",
  });
  const machineAtoms = signActionAtom(wallet);

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-start gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            navigate({
              to: "/order/$marketId/$side",
              params: { marketId, side },
            })
          }
        >
          <ArrowLeft className="size-6 text-gray-2" />
        </Button>
        <p className="flex-1 font-semibold text-xl text-foreground tracking-[-0.6px]">
          Sign Order
        </p>
      </div>

      {/* Sign Transactions Component */}
      <SignTransactions title="Order Progress" machineAtoms={machineAtoms} />

      {/* Back to Home Button */}
      <div className="w-full mt-auto pt-6 flex">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => navigate({ to: "/" })}
        >
          Back to Home
        </Button>
      </div>
    </div>
  );
}

export function OrderSignRoute() {
  return (
    <WalletProtectedRoute>
      {(wallet) => {
        return <OrderSignRouteWithWallet wallet={wallet} />;
      }}
    </WalletProtectedRoute>
  );
}
