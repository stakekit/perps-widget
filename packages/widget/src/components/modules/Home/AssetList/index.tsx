import { Result, useAtomValue } from "@effect-atom/atom-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { marketsAtom, walletAtom } from "@yieldxyz/perps-common/atoms";
import { AssetSkeleton, Text } from "@yieldxyz/perps-common/components";
import { Array as _Array, Option, Record } from "effect";
import {
  ArrowDownUp,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Search,
  X,
} from "lucide-react";
import { useRef, useState } from "react";
import { AssetItem } from "./item";

export function AssetList() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc" | null>(
    null,
  );
  const parentRef = useRef<HTMLDivElement>(null);

  const markets = useAtomValue(marketsAtom);
  const wallet = useAtomValue(walletAtom);

  const isLoading = Result.isInitial(markets) || Result.isInitial(wallet);

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
    Result.map((v) =>
      sortDirection
        ? [...v].sort((a, b) => {
            const changeA = a.value.priceChangePercent24h;
            const changeB = b.value.priceChangePercent24h;

            return sortDirection === "desc"
              ? changeB - changeA
              : changeA - changeB;
          })
        : v,
    ),
    Result.getOrElse(() => []),
  );

  const rowVirtualizer = useVirtualizer({
    count: marketData.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 70,
    overscan: 5,
    gap: 8,
  });

  const toggleSort = () => {
    setSortDirection((prev) => {
      if (prev === null) return "desc";
      if (prev === "desc") return "asc";
      return null;
    });
  };

  const hasNoResults =
    marketData.length === 0 &&
    searchQuery.trim() !== "" &&
    !Result.isInitial(markets);

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Search input */}
      <div className="relative w-full h-9">
        <div className="absolute inset-0 bg-white/5 rounded-xl flex items-center gap-2 px-4">
          <Search className="w-4 h-4 text-gray-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search"
            className="flex-1 bg-transparent border-none outline-none text-xs font-semibold text-white placeholder:text-gray-2 tracking-tight"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              className="p-0.5 hover:bg-white/10 rounded transition-colors"
            >
              <X className="w-3 h-3 text-gray-2" />
            </button>
          )}
        </div>
      </div>

      {/* Empty state when no results */}
      {hasNoResults ? (
        <div className="flex flex-col items-center gap-5 pt-12 pb-4">
          <Search className="w-8 h-8 text-gray-2" />
          <Text as="p" variant="headingBaseTight" className="text-center">
            This asset isn't available on Hyperliquid
          </Text>
          <Text as="p" variant="helperSmGray1Tight" className="text-center">
            Please switch the provider to continue
          </Text>
          <div className="pt-4">
            <button
              type="button"
              className="bg-[#212121] h-11 px-6 rounded-2xl text-white font-semibold text-base tracking-tight hover:bg-[#2a2a2a] transition-colors"
            >
              Change provider
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="flex justify-between items-center h-2.5">
            <Text as="span" variant="labelSm" className="text-foreground">
              Quote
            </Text>
            <button
              type="button"
              onClick={toggleSort}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <Text
                as="span"
                variant="inherit"
                className={`text-sm tracking-tight ${
                  sortDirection ? "text-foreground" : "text-foreground/60"
                }`}
              >
                Price / 24 change
              </Text>
              {sortDirection === "desc" ? (
                <ArrowDownWideNarrow className="w-2.5 h-2.5 text-foreground" />
              ) : sortDirection === "asc" ? (
                <ArrowUpNarrowWide className="w-2.5 h-2.5 text-foreground" />
              ) : (
                <ArrowDownUp className="w-2.5 h-2.5 text-foreground/60" />
              )}
            </button>
          </div>

          {/* Loading skeleton */}
          {isLoading ? (
            <div className="flex flex-col gap-2 w-full">
              <AssetSkeleton key="skeleton-0" />
              <AssetSkeleton key="skeleton-1" />
              <AssetSkeleton key="skeleton-2" />
              <AssetSkeleton key="skeleton-3" />
              <AssetSkeleton key="skeleton-4" />
            </div>
          ) : (
            /* Asset list with virtualization */
            <div
              ref={parentRef}
              className="overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent h-[400px]"
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
                      <AssetItem marketRef={market} />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AssetList;
