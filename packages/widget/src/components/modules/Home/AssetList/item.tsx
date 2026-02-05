import { type AtomRef, useAtomRef } from "@effect-atom/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { Text, TokenIcon } from "@yieldxyz/perps-common/components";
import {
  formatAmount,
  formatPercentage,
  getMaxLeverage,
  getTokenLogo,
} from "@yieldxyz/perps-common/lib";
import type { ApiSchemas } from "@yieldxyz/perps-common/services";

export interface AssetItemProps {
  marketRef: AtomRef.AtomRef<ApiSchemas.MarketDto>;
}

export function AssetItem({ marketRef }: AssetItemProps) {
  const market = useAtomRef(marketRef);
  const navigate = useNavigate();

  const logo = getTokenLogo(market.baseAsset.symbol);
  const isPositive = market.priceChangePercent24h >= 0;

  const maxLeverage = getMaxLeverage(market.leverageRange);

  const handleNavigate = () =>
    navigate({
      to: "/position-details/$marketId",
      params: { marketId: market.id },
    });

  return (
    <button
      type="button"
      onClick={handleNavigate}
      className="flex items-center gap-2 w-full px-4 py-3 cursor-pointer transition-colors hover:bg-white/10 bg-white/5 rounded-2xl"
    >
      <div className="flex items-center gap-2 w-full">
        {/* Token icon */}
        <div className="relative shrink-0 size-9">
          <TokenIcon logoURI={logo} name={market.baseAsset.symbol} />
        </div>

        {/* Token info */}
        <div className="flex-1 flex flex-col gap-2.5 items-start justify-center min-w-0">
          <div className="flex items-center gap-2.5">
            <Text as="span" variant="labelBaseWhite">
              {market.baseAsset.symbol}
            </Text>
            {maxLeverage && (
              <Text as="span" variant="badgeWhiteTight">
                Up to {maxLeverage}x
              </Text>
            )}
          </div>
          <Text as="span" variant="labelXsGray2">
            {formatAmount(market.volume24h, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </Text>
        </div>

        {/* Price and change */}
        <div className="flex flex-col items-end justify-center gap-3">
          <Text as="span" variant="labelBaseWhite">
            {formatAmount(market.markPrice)}
          </Text>
          <Text
            as="span"
            variant="labelXs"
            className={isPositive ? "text-accent-green" : "text-accent-red"}
          >
            {isPositive ? "+" : ""}
            {formatPercentage(market.priceChangePercent24h)}
          </Text>
        </div>
      </div>
    </button>
  );
}
