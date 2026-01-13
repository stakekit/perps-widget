import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { signWithdrawActionAtom } from "@/atoms/withdraw-action-atom";
import { SignTransactions } from "@/components/modules/SignTransactions";
import { Button } from "@/components/ui/button";

export function WithdrawSignRoute() {
  const navigate = useNavigate();

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
      <SignTransactions
        atom={signWithdrawActionAtom}
        title="Withdrawal Progress"
      />

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
