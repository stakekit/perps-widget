// import { useVirtualizer } from "@tanstack/react-virtual";
import clsx from "clsx";
import {
  ArrowDownUp,
  ArrowDownWideNarrow,
  ArrowUpNarrowWide,
  Search,
  X,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

// Crypto token logos from public sources
const CRYPTO_LOGOS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
  ZEC: "https://assets.coingecko.com/coins/images/486/small/circle-zcash-color.png",
  AVAX: "https://assets.coingecko.com/coins/images/12559/small/Avalanche_Circle_RedWhite_Trans.png",
  DOGE: "https://assets.coingecko.com/coins/images/5/small/dogecoin.png",
  LINK: "https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png",
  MATIC: "https://assets.coingecko.com/coins/images/4713/small/polygon.png",
  UNI: "https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png",
  ARB: "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  OP: "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  XRP: "https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png",
  ADA: "https://assets.coingecko.com/coins/images/975/small/cardano.png",
  DOT: "https://assets.coingecko.com/coins/images/12171/small/polkadot.png",
};

// Network/blockchain logos
const NETWORK_LOGOS: Record<string, string> = {
  hyperliquid:
    "https://assets.coingecko.com/coins/images/34367/small/Hyperliquid.jpeg",
  arbitrum:
    "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  optimism:
    "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  base: "https://assets.coingecko.com/coins/images/40637/small/base.png",
  ethereum: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
};

export interface NetworkVariant {
  id: string;
  network: string;
  networkLogo: string;
  leverage: string;
  volume: string;
  price: string;
  change24h: number;
}

export interface Asset {
  id: string;
  symbol: string;
  leverage: string;
  volume: string;
  price: string;
  change24h: number;
  badgeIcon?: string;
  networkVariants?: NetworkVariant[];
}

// Dummy data for the asset list
export const DUMMY_ASSETS: Asset[] = [
  {
    id: "1",
    symbol: "BTC",
    leverage: "Up to 60x",
    volume: "$81.62B",
    price: "$100,445.00",
    change24h: 5.6,
    networkVariants: [
      {
        id: "1-hl",
        network: "hyperliquid",
        networkLogo: NETWORK_LOGOS.hyperliquid,
        leverage: "60x",
        volume: "$21.52B",
        price: "$100,245.00",
        change24h: 2.6,
      },
      {
        id: "1-arb",
        network: "arbitrum",
        networkLogo: NETWORK_LOGOS.arbitrum,
        leverage: "25x",
        volume: "$11.62B",
        price: "$100,355.00",
        change24h: 2.7,
      },
      {
        id: "1-op",
        network: "optimism",
        networkLogo: NETWORK_LOGOS.optimism,
        leverage: "40x",
        volume: "$5.62B",
        price: "$100,445.00",
        change24h: 2.3,
      },
      {
        id: "1-base",
        network: "base",
        networkLogo: NETWORK_LOGOS.base,
        leverage: "15x",
        volume: "$2.62B",
        price: "$100,345.00",
        change24h: 1.6,
      },
    ],
  },
  {
    id: "2",
    symbol: "ETH",
    leverage: "Up to 25x",
    volume: "$21.62B",
    price: "$3,104.78",
    change24h: 4.71,
  },
  {
    id: "3",
    symbol: "SOL",
    leverage: "Up to 20x",
    volume: "$512.33M",
    price: "$138.53",
    change24h: 9.38,
  },
  {
    id: "5",
    symbol: "ZEC",
    leverage: "10x",
    volume: "$302.62M",
    price: "$310.52",
    change24h: -8.38,
  },
  {
    id: "6",
    symbol: "AVAX",
    leverage: "Up to 20x",
    volume: "$892.12M",
    price: "$42.87",
    change24h: 3.24,
  },
  {
    id: "7",
    symbol: "DOGE",
    leverage: "Up to 15x",
    volume: "$1.23B",
    price: "$0.1234",
    change24h: -2.15,
  },
  {
    id: "8",
    symbol: "LINK",
    leverage: "Up to 25x",
    volume: "$654.32M",
    price: "$18.75",
    change24h: 6.82,
  },
  {
    id: "9",
    symbol: "MATIC",
    leverage: "Up to 15x",
    volume: "$432.11M",
    price: "$0.8642",
    change24h: 1.92,
  },
  {
    id: "10",
    symbol: "UNI",
    leverage: "Up to 20x",
    volume: "$287.45M",
    price: "$12.34",
    change24h: -0.87,
  },
  {
    id: "11",
    symbol: "ARB",
    leverage: "Up to 15x",
    volume: "$198.76M",
    price: "$1.23",
    change24h: 4.56,
  },
  {
    id: "12",
    symbol: "OP",
    leverage: "Up to 15x",
    volume: "$156.89M",
    price: "$2.87",
    change24h: 7.21,
  },
  {
    id: "13",
    symbol: "XRP",
    leverage: "Up to 20x",
    volume: "$2.34B",
    price: "$0.6234",
    change24h: -3.45,
  },
  {
    id: "14",
    symbol: "ADA",
    leverage: "Up to 15x",
    volume: "$567.89M",
    price: "$0.4521",
    change24h: 2.34,
  },
  {
    id: "15",
    symbol: "DOT",
    leverage: "Up to 15x",
    volume: "$345.67M",
    price: "$7.89",
    change24h: -1.23,
  },
];

interface AssetItemProps {
  asset: Asset;
  showBadge?: boolean;
  badgeIcon?: string;
}

function AssetItemContent({ asset, showBadge, badgeIcon }: AssetItemProps) {
  const isPositive = asset.change24h >= 0;
  const logo = CRYPTO_LOGOS[asset.symbol];

  return (
    <div className="flex items-center gap-2 w-full">
      {/* Token icon */}
      <div className="relative shrink-0 size-9">
        <img
          src={logo}
          alt={asset.symbol}
          className="w-full h-full rounded-full object-cover"
        />
        {showBadge && badgeIcon && (
          <div className="absolute -bottom-0.5 -right-0.5 size-[18px] rounded-full border-2 border-[#1c1d1d] overflow-hidden">
            <img
              src={badgeIcon}
              alt=""
              className="w-full h-full object-cover"
            />
          </div>
        )}
      </div>

      {/* Token info */}
      <div className="flex-1 flex flex-col gap-2.5 items-start justify-center min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-white font-semibold text-base tracking-tight">
            {asset.symbol}
          </span>
          <span className="bg-white/25 px-1.5 py-1 rounded text-[11px] text-white text-center leading-tight">
            {asset.leverage}
          </span>
        </div>
        <span className="text-gray-2 font-semibold text-xs tracking-tight">
          {asset.volume}
        </span>
      </div>

      {/* Price and change */}
      <div className="flex flex-col items-end justify-center gap-3">
        <span className="text-white font-semibold text-base tracking-tight">
          {asset.price}
        </span>
        <span
          className={`font-semibold text-xs tracking-tight ${
            isPositive ? "text-accent-green" : "text-accent-red"
          }`}
        >
          {isPositive ? "+" : ""}
          {asset.change24h.toFixed(2)}%
        </span>
      </div>
    </div>
  );
}

interface NetworkVariantItemProps {
  variant: NetworkVariant;
  symbol: string;
  isLast: boolean;
}

function NetworkVariantItem({
  variant,
  symbol,
  isLast,
}: NetworkVariantItemProps) {
  const isPositive = variant.change24h >= 0;
  const logo = CRYPTO_LOGOS[symbol];

  return (
    <button
      type="button"
      className={`flex items-center gap-2 w-full px-4 py-4 cursor-pointer transition-colors hover:bg-white/5 bg-[#1c1d1d] border-b border-[#060607] ${
        isLast ? "rounded-b-2xl border-b-0" : ""
      }`}
    >
      {/* Token icon with network badge */}
      <div className="relative shrink-0 size-9">
        <img
          src={logo}
          alt={symbol}
          className="w-full h-full rounded-full object-cover"
        />
        <div className="absolute -bottom-0.5 -right-0.5 size-[18px] rounded-full border-2 border-[#1c1d1d] overflow-hidden">
          <img
            src={variant.networkLogo}
            alt={variant.network}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      {/* Token info */}
      <div className="flex-1 flex flex-col gap-2.5 items-start justify-center min-w-0">
        <div className="flex items-center gap-2.5">
          <span className="text-white font-semibold text-base tracking-tight">
            {symbol}
          </span>
          <span className="bg-white/25 px-1.5 py-1 rounded text-[11px] text-white text-center leading-tight">
            {variant.leverage}
          </span>
        </div>
        <span className="text-gray-2 font-semibold text-xs tracking-tight">
          {variant.volume}
        </span>
      </div>

      {/* Price and change */}
      <div className="flex flex-col items-end justify-center gap-2.5">
        <span className="text-white font-semibold text-base tracking-tight">
          {variant.price}
        </span>
        <span
          className={`font-semibold text-xs tracking-tight ${
            isPositive ? "text-accent-green" : "text-accent-red"
          }`}
        >
          {isPositive ? "+" : ""}
          {variant.change24h.toFixed(2)}%
        </span>
      </div>
    </button>
  );
}

interface AccordionAssetItemProps {
  asset: Asset;
}

function AccordionAssetItem({ asset }: AccordionAssetItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasVariants = asset.networkVariants && asset.networkVariants.length > 0;

  if (!hasVariants) {
    return (
      <button
        type="button"
        className="flex items-center gap-2 w-full px-4 py-3 cursor-pointer transition-colors hover:bg-white/10 bg-white/5 rounded-2xl"
      >
        <AssetItemContent asset={asset} />
      </button>
    );
  }

  return (
    <div className="w-full overflow-hidden rounded-2xl">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "group flex items-center gap-2 w-full px-4 py-3 cursor-pointer transition-colors bg-white/5 border-b border-[#060607]",
          isOpen && "rounded-b-none bg-white/5",
          !isOpen && "hover:bg-white/10",
        )}
      >
        <AssetItemContent asset={asset} />
      </button>

      <div
        className="flex flex-col transition-[height] duration-300 ease-out"
        style={{ height: isOpen ? "auto" : "0" }}
      >
        {asset.networkVariants?.map((variant, index) => (
          <NetworkVariantItem
            key={variant.id}
            variant={variant}
            symbol={asset.symbol}
            isLast={index === (asset.networkVariants?.length ?? 0) - 1}
          />
        ))}
      </div>
    </div>
  );
}

interface AssetListProps {
  assets?: Asset[];
  maxHeight?: number;
  onAssetClick?: (asset: Asset) => void;
}

type SortDirection = "asc" | "desc" | null;

export function AssetList({
  assets = DUMMY_ASSETS,
  maxHeight = 400,
}: AssetListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const parentRef = useRef<HTMLDivElement>(null);

  const filteredAndSortedAssets = useMemo(() => {
    let result = assets;

    // Filter by search query
    if (searchQuery.trim()) {
      result = result.filter((asset) =>
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
      );
    }

    // Sort by 24h change
    if (sortDirection) {
      result = [...result].sort((a, b) => {
        if (sortDirection === "desc") {
          return b.change24h - a.change24h;
        }
        return a.change24h - b.change24h;
      });
    }

    return result;
  }, [assets, searchQuery, sortDirection]);

  const toggleSort = () => {
    setSortDirection((prev) => {
      if (prev === null) return "desc";
      if (prev === "desc") return "asc";
      return null;
    });
  };

  const hasNoResults =
    filteredAndSortedAssets.length === 0 && searchQuery.trim() !== "";

  // const rowVirtualizer = useVirtualizer({
  //   count: filteredAndSortedAssets.length,
  //   getScrollElement: () => parentRef.current,
  //   estimateSize: () => 78, // 70px item height + 8px gap
  //   overscan: 5,
  // });

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
          <p className="text-foreground font-semibold text-base tracking-tight text-center">
            This asset isn't available on Hyperliquid
          </p>
          <p className="text-gray-1 text-sm tracking-tight text-center">
            Please switch the provider to continue
          </p>
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
            <span className="text-foreground font-semibold text-sm tracking-tight">
              Volume
            </span>
            <button
              type="button"
              onClick={toggleSort}
              className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
            >
              <span
                className={`text-sm tracking-tight ${sortDirection ? "text-foreground" : "text-foreground/60"}`}
              >
                Price / 24 change
              </span>
              {sortDirection === "desc" ? (
                <ArrowDownWideNarrow className="w-2.5 h-2.5 text-foreground" />
              ) : sortDirection === "asc" ? (
                <ArrowUpNarrowWide className="w-2.5 h-2.5 text-foreground" />
              ) : (
                <ArrowDownUp className="w-2.5 h-2.5 text-foreground/60" />
              )}
            </button>
          </div>

          {/* Asset list with accordion support */}
          <div
            ref={parentRef}
            className="overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
            style={{ height: `${maxHeight}px` }}
          >
            <div className="flex flex-col gap-2 w-full">
              {filteredAndSortedAssets.map((asset) => (
                <AccordionAssetItem key={asset.id} asset={asset} />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default AssetList;
