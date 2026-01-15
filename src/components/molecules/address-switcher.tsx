import { useAppKit } from "@reown/appkit/react";
import { ChevronDown, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { WalletConnected } from "@/domain/wallet";
import { truncateAddress } from "@/lib/utils";

export const AddressSwitcher = ({ wallet }: { wallet: WalletConnected }) => {
  const { open } = useAppKit();

  return (
    <div className="flex justify-center items-center gap-2">
      {/* Address Switcher */}
      <Button
        variant="secondary"
        size="lg"
        className="px-4"
        onClick={() => open({ view: "Account" })}
      >
        <Wallet className="size-4 text-gray-2" />
        <span className="font-medium text-foreground tracking-tight">
          {truncateAddress(wallet.currentAccount.address)}
        </span>
        <ChevronDown className="size-4 text-gray-2" />
      </Button>
    </div>
  );
};
