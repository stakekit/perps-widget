import { Result, useAtomValue } from "@effect-atom/atom-react";
import { selectedProviderBalancesAtom } from "@yieldxyz/perps-common/atoms";
import { Skeleton, Text } from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import { cn, formatAmount, getTokenLogo } from "@yieldxyz/perps-common/lib";

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
          <Text as="p" variant="labelSmGray2NegTight">
            Account value
          </Text>
          <Text as="p" variant="titleLg">
            {formatAmount(selectedProviderBalances.value.accountValue)}
          </Text>
        </div>
      </div>
    );
  }

  return <Skeleton className="size-10" />;
}
