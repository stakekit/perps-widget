import { useNavigate } from "@tanstack/react-router";
import { signActionAtoms } from "@/atoms/actions-atoms";
import { BackButton } from "@/components/molecules/navigation/back-button";
import { WalletProtectedRoute } from "@/components/molecules/navigation/wallet-protected-route";
import { SignTransactions } from "@/components/molecules/sign/sign-content";
import { Button } from "@/components/ui/button";
import type { WalletConnected } from "@/domain/wallet";

function SignTransactionsWithWallet({
  wallet,
  title,
}: {
  title: string;
  wallet: WalletConnected;
}) {
  const navigate = useNavigate();

  const machineAtoms = signActionAtoms(wallet.signTransactions);

  return (
    <div className="flex flex-col gap-6 w-full h-full">
      {/* Header */}
      <div className="flex items-center justify-start gap-2">
        <BackButton />
        <p className="flex-1 font-semibold text-xl text-foreground tracking-[-0.6px]">
          {title}
        </p>
      </div>

      {/* Sign Transactions Component */}
      <SignTransactions machineAtoms={machineAtoms} />

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

export function SignTransactionsRoute({ title }: { title: string }) {
  return (
    <WalletProtectedRoute>
      {(wallet) => <SignTransactionsWithWallet wallet={wallet} title={title} />}
    </WalletProtectedRoute>
  );
}
