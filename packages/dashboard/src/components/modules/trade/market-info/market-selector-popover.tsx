import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomValue,
} from "@effect-atom/atom-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { marketsAtom } from "@yieldxyz/perps-common/atoms";
import { Skeleton, Text, TokenIcon } from "@yieldxyz/perps-common/components";
import {
  cn,
  formatAmount,
  formatCompactUsdAmount,
  formatPercentage,
  formatRate,
  getMaxLeverage,
  getTokenLogo,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { Array as _Array, Option, Record } from "effect";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface MarketSelectorContentProps {
  onSelect: (marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>) => void;
}

interface MarketRowProps {
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
  onSelect: (marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>) => void;
}

function MarketRow({ marketRef, onSelect }: MarketRowProps) {
  const market = useAtomRef(marketRef);
  const isPositiveChange = market.priceChangePercent24h >= 0;
  const isPositiveFunding = Number(market.fundingRate) >= 0;
  const maxLeverage = getMaxLeverage(market.leverageRange);
  const logo = getTokenLogo(market.baseAsset.symbol);

  return (
    <button
      type="button"
      onClick={() => onSelect(marketRef)}
      className="grid grid-cols-[minmax(180px,1.5fr)_1fr_1.5fr_repeat(3,1fr)] gap-4 items-center w-full px-4 py-3 hover:bg-white/5 transition-colors text-left"
    >
      {/* Symbol */}
      <div className="flex items-center gap-2">
        <TokenIcon logoURI={logo} name={market.baseAsset.symbol} size="sm" />
        <Text variant="labelSmWhiteNeg" className="font-medium">
          {market.baseAsset.symbol}-USDC
        </Text>
        {maxLeverage && (
          <span className="px-1.5 py-0.5 bg-white/10 text-white/60 text-[10px] font-medium rounded">
            {maxLeverage}x
          </span>
        )}
      </div>

      {/* Last Price */}
      <Text variant="labelSmWhiteNeg" className="font-medium">
        {formatAmount(market.markPrice, { maximumFractionDigits: 2 })}
      </Text>

      {/* 24H Change */}
      <Text
        variant="labelSmWhiteNeg"
        className={cn(
          "font-medium",
          isPositiveChange ? "text-accent-green" : "text-accent-red",
        )}
      >
        {isPositiveChange ? "+" : ""}
        {formatAmount(market.priceChange24h, { maximumFractionDigits: 2 })} /{" "}
        {isPositiveChange ? "+" : ""}
        {formatPercentage(market.priceChangePercent24h)}
      </Text>

      {/* 8H Funding */}
      <Text
        variant="labelSmWhiteNeg"
        className={cn(
          "font-medium",
          isPositiveFunding ? "text-accent-green" : "text-accent-red",
        )}
      >
        {formatRate(market.fundingRate, { maximumFractionDigits: 4 })}
      </Text>

      {/* Volume */}
      <Text variant="labelSmWhiteNeg" className="font-medium">
        {formatCompactUsdAmount(market.volume24h)}
      </Text>

      {/* Open Interest */}
      <Text variant="labelSmWhiteNeg" className="font-medium">
        {formatCompactUsdAmount(market.openInterest)}
      </Text>
    </button>
  );
}

function MarketRowSkeleton() {
  return (
    <div className="grid grid-cols-[minmax(180px,1.5fr)_1fr_1.5fr_repeat(3,1fr)] gap-4 items-center w-full px-4 py-3">
      <div className="flex items-center gap-2">
        <Skeleton className="size-5 rounded-full" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-8 rounded" />
      </div>
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
      <Skeleton className="h-4 w-16" />
    </div>
  );
}

export function MarketSelectorContent({
  onSelect,
}: MarketSelectorContentProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const parentRef = useRef<HTMLDivElement>(null);

  const markets = useAtomValue(marketsAtom);

  const isLoading = Result.isInitial(markets) || Result.isWaiting(markets);

  const marketData = markets.pipe(
    Result.map(Record.values),
    Result.map((v) =>
      searchQuery.trim()
        ? v.filter((market) =>
            market.value.baseAsset.symbol
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
          )
        : v,
    ),
    Result.getOrElse(() => []),
  );

  const rowVirtualizer = useVirtualizer({
    count: marketData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 44,
    overscan: 5,
  });

  const hasNoResults =
    marketData.length === 0 &&
    searchQuery.trim() !== "" &&
    !Result.isInitial(markets);

  return (
    <div className="flex flex-col w-[835px]">
      {/* Search input */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 h-9">
          <Search className="size-4 text-gray-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent border-none outline-none text-sm text-white placeholder:text-gray-2"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-0.5 hover:bg-white/10 rounded transition-colors"
            >
              <X className="size-3 text-gray-2" />
            </button>
          )}
        </div>
      </div>

      {/* Table header */}
      <div className="grid grid-cols-[minmax(180px,1.5fr)_1fr_1.5fr_repeat(3,1fr)] gap-4 items-center px-4 py-2 border-b border-white/10">
        <Text variant="labelXsGray2">Symbol</Text>
        <Text variant="labelXsGray2">Last Price</Text>
        <Text variant="labelXsGray2">24H Change</Text>
        <Text variant="labelXsGray2">8H Funding</Text>
        <Text variant="labelXsGray2">Volume</Text>
        <Text variant="labelXsGray2">Open Interest</Text>
      </div>

      {/* Empty state */}
      {hasNoResults ? (
        <div className="flex flex-col items-center gap-4 py-12">
          <Search className="size-8 text-gray-2" />
          <Text variant="labelSmWhiteNeg" className="text-center">
            No markets found
          </Text>
          <Text variant="labelXsGray2" className="text-center">
            Try searching for a different symbol
          </Text>
        </div>
      ) : isLoading ? (
        <div className="flex flex-col">
          <MarketRowSkeleton />
          <MarketRowSkeleton />
          <MarketRowSkeleton />
          <MarketRowSkeleton />
          <MarketRowSkeleton />
        </div>
      ) : (
        /* Market list with virtualization */
        <div
          ref={parentRef}
          className="overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent h-[350px]"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: "100%",
              position: "relative",
            }}
          >
            {rowVirtualizer.getVirtualItems().map((virtualItem) => {
              const market = _Array
                .get(marketData, virtualItem.index)
                .pipe(Option.getOrThrow);

              return (
                <div
                  key={virtualItem.key}
                  style={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: `${virtualItem.size}px`,
                    transform: `translateY(${virtualItem.start}px)`,
                  }}
                >
                  <MarketRow marketRef={market} onSelect={onSelect} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
