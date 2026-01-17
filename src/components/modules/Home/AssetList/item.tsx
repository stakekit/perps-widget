import { type AtomRef, useAtomRef } from "@effect-atom/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { Array as _Array, Option } from "effect";
import { TokenIcon } from "@/components/molecules/token-icon";
import { formatAmount, formatPercentage, getTokenLogo } from "@/lib/utils";
import type { MarketDto } from "@/services/api-client/api-schemas";

export interface AssetItemProps {
  marketRef: AtomRef.AtomRef<MarketDto>;
}

export function AssetItem({ marketRef }: AssetItemProps) {
  const market = useAtomRef(marketRef);
  const navigate = useNavigate();

  const logo = getTokenLogo(market.baseAsset.symbol);
  const isPositive = market.priceChangePercent24h >= 0;

  const maxLeverage = _Array.last(market.leverageRange).pipe(
    Option.orElse(() => _Array.head(market.leverageRange)),
    Option.getOrNull,
  );

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
            <span className="text-white font-semibold text-base tracking-tight">
              {market.baseAsset.symbol}
            </span>
            {maxLeverage && (
              <span className="bg-white/25 px-1.5 py-1 rounded text-[11px] text-white text-center leading-tight">
                Up to {maxLeverage}x
              </span>
            )}
          </div>
          <span className="text-gray-2 font-semibold text-xs tracking-tight">
            {formatAmount(market.volume24h, {
              minimumFractionDigits: 0,
              maximumFractionDigits: 0,
            })}
          </span>
        </div>

        {/* Price and change */}
        <div className="flex flex-col items-end justify-center gap-3">
          <span className="text-white font-semibold text-base tracking-tight">
            {formatAmount(market.markPrice)}
          </span>
          <span
            className={`font-semibold text-xs tracking-tight ${
              isPositive ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {isPositive ? "+" : ""}
            {formatPercentage(market.priceChangePercent24h)}
          </span>
        </div>
      </div>
    </button>
  );
}
