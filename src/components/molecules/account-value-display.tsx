import { Result, useAtomValue } from "@effect-atom/atom-react";
import { selectedProviderBalancesAtom } from "@/atoms/portfolio-atoms";
import { Skeleton } from "@/components/ui/skeleton";
import type { WalletConnected } from "@/domain/wallet";
import { cn, formatAmount, getTokenLogo } from "@/lib/utils";

export function AccountValueDisplay({ wallet }: { wallet: WalletConnected }) {
  const selectedProviderBalances = useAtomValue(
    selectedProviderBalancesAtom(wallet.currentAccount.address),
  );

  if (Result.isSuccess(selectedProviderBalances)) {
    return (
      <div className={cn("flex gap-2 items-center")}>
        <img
          src={getTokenLogo(selectedProviderBalances.value.collateral.symbol)}
          alt="USDC"
          className="size-9"
        />
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <p className="text-gray-2 font-semibold text-sm leading-tight tracking-[-0.42px]">
            Account value
          </p>
          <p className="text-foreground text-lg font-semibold leading-tight tracking-[-0.72px]">
            {formatAmount(selectedProviderBalances.value.accountValue)}
          </p>
        </div>
      </div>
    );
  }

  return <Skeleton className="size-10" />;
}
