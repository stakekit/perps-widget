import { useNavigate } from "@tanstack/react-router";
import { signActionAtoms } from "@yieldxyz/perps-common/atoms";
import { Button, Text } from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import { BackButton } from "../navigation/back-button";
import { WalletProtectedRoute } from "../navigation/wallet-protected-route";
import { SignTransactions } from "./sign-content";

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
        <Text as="p" variant="titleXlTight" className="flex-1">
          {title}
        </Text>
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
