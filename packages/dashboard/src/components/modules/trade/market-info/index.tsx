import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Popover, Text, TokenIcon } from "@yieldxyz/perps-common/components";
import {
  cn,
  formatAmount,
  formatCompactUsdAmount,
  formatPercentage,
  formatRate,
  getTokenLogo,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { selectedMarketAtom } from "../../../../atoms/selected-market-atom";
import { MarketInfoBarSkeleton } from "./bar-skeleton";
import { MarketSelectorContent } from "./market-selector-popover";

interface MarketInfoBarProps {
  className?: string;
}

function MarketInfoBarContent({
  marketRef,
  className,
}: {
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
  className?: string;
}) {
  const market = useAtomRef(marketRef);
  const setSelectedMarket = useAtomSet(selectedMarketAtom);
  const [isOpen, setIsOpen] = useState(false);
  const isPositiveChange = market.priceChangePercent24h >= 0;
  const logo =
    market.baseAsset.logoURI ?? getTokenLogo(market.baseAsset.symbol);

  const handleMarketSelect = (
    marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>,
  ) => {
    setSelectedMarket(marketRef);
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "flex items-center gap-6 px-4 py-3 bg-content-background rounded-[10px]",
        className,
      )}
    >
      {/* Asset Selector */}
      <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
        <Popover.Trigger className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="flex items-center gap-2">
            <TokenIcon
              size="md"
              logoURI={logo}
              name={market.baseAsset.symbol}
            />
            <Text variant="labelBaseWhite" className="font-semibold">
              {market.baseAsset.symbol}
            </Text>
          </div>
          <ChevronDown className="size-4 text-white/60" />
          <span className="px-1.5 py-0.5 bg-accent-green/20 text-accent-green text-[10px] font-semibold rounded">
            Perp
          </span>
        </Popover.Trigger>
        <Popover.Portal>
          <Popover.Positioner side="bottom" align="start" sideOffset={8}>
            <Popover.Popup>
              <MarketSelectorContent onSelect={handleMarketSelect} />
            </Popover.Popup>
          </Popover.Positioner>
        </Popover.Portal>
      </Popover.Root>

      {/* Divider */}
      <div className="h-6 w-px bg-white/10" />

      {/* Price */}
      <div className="flex flex-col gap-0.5">
        <Text variant="bodySmGray2" className="text-[11px]">
          Price
        </Text>
        <Text variant="labelSmWhiteNeg" className="font-medium">
          {formatAmount(market.markPrice)}
        </Text>
      </div>

      {/* 24H Change */}
      <div className="flex flex-col gap-0.5">
        <Text variant="bodySmGray2" className="text-[11px]">
          24H Change
        </Text>
        <Text
          variant="labelSmWhiteNeg"
          className={cn(
            "font-medium",
            isPositiveChange ? "text-[#71e96d]" : "text-[#ff4141]",
          )}
        >
          {isPositiveChange ? "+" : ""}
          {formatAmount(market.priceChange24h)} / {isPositiveChange ? "+" : ""}
          {formatPercentage(market.priceChangePercent24h)}
        </Text>
      </div>

      {/* 24H Volume */}
      <div className="flex flex-col gap-0.5">
        <Text variant="bodySmGray2" className="text-[11px]">
          24H Volume
        </Text>
        <Text variant="labelSmWhiteNeg" className="font-medium">
          {formatCompactUsdAmount(market.volume24h)}
        </Text>
      </div>

      {/* Open Interest */}
      <div className="flex flex-col gap-0.5">
        <Text variant="bodySmGray2" className="text-[11px]">
          Open Interest
        </Text>
        <Text variant="labelSmWhiteNeg" className="font-medium">
          {formatCompactUsdAmount(market.openInterest * market.markPrice)}
        </Text>
      </div>

      {/* Maker Fee */}
      <div className="flex flex-col gap-0.5">
        <Text variant="bodySmGray2" className="text-[11px]">
          Maker Fee
        </Text>
        <Text variant="labelSmWhiteNeg" className="font-medium">
          {market.makerFee ? formatRate(market.makerFee) : "-"}
        </Text>
      </div>

      {/* Taker Fee */}
      <div className="flex flex-col gap-0.5">
        <Text variant="bodySmGray2" className="text-[11px]">
          Taker Fee
        </Text>
        <Text variant="labelSmWhiteNeg" className="font-medium">
          {market.takerFee ? formatRate(market.takerFee) : "-"}
        </Text>
      </div>
    </div>
  );
}

export function MarketInfoBar({ className }: MarketInfoBarProps) {
  const marketResult = useAtomValue(selectedMarketAtom);

  if (Result.isInitial(marketResult) || Result.isWaiting(marketResult)) {
    return <MarketInfoBarSkeleton className={className} />;
  }

  if (!Result.isSuccess(marketResult)) {
    return <MarketInfoBarSkeleton className={className} />;
  }

  return (
    <MarketInfoBarContent
      marketRef={marketResult.value}
      className={className}
    />
  );
}
