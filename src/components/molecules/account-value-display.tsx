import { Result, useAtomValue } from "@effect-atom/atom-react";
import { selectedProviderBalancesAtom } from "@/atoms/portfolio-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatAmount, getTokenLogo } from "@/lib/utils";

export function AccountValueDisplay() {
  const wallet = useAtomValue(walletAtom);
  const selectedProviderBalances = useAtomValue(
    selectedProviderBalancesAtom,
  ).pipe(Result.builder);

  if (wallet.waiting) {
    return <Skeleton className="size-10" />;
  }

  return selectedProviderBalances
    .onSuccess((balances) => (
      <div className={cn("flex gap-2 items-center")}>
        <img
          src={getTokenLogo(balances.collateral.symbol)}
          alt="USDC"
          className="size-9"
        />
        <div className="flex-1 flex flex-col gap-2 justify-center">
          <p className="text-gray-2 font-semibold text-sm leading-tight tracking-[-0.42px]">
            Account value
          </p>
          <p className="text-foreground text-lg font-semibold leading-tight tracking-[-0.72px]">
            {formatAmount(balances.accountValue)}
          </p>
        </div>
      </div>
    ))
    .orElse(() => <Skeleton className="size-10" />);
}
