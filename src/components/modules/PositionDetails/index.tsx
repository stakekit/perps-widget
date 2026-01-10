import { Link, useParams } from "@tanstack/react-router";
import { ChevronLeft } from "lucide-react";
import { useState } from "react";
import Chart from "@/components/modules/PositionDetails/chart";
import { Button } from "@/components/ui/button";
import { Card, CardSection } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

// Network badge
const NETWORK_LOGOS: Record<string, string> = {
  hyperliquid:
    "https://assets.coingecko.com/coins/images/34367/small/Hyperliquid.jpeg",
  arbitrum:
    "https://assets.coingecko.com/coins/images/16547/small/photo_2023-03-29_21.47.00.jpeg",
  optimism:
    "https://assets.coingecko.com/coins/images/25244/small/Optimism.png",
  base: "https://assets.coingecko.com/coins/images/40637/small/base.png",
};

// Mock asset data (in real app, fetch based on ID)
const MOCK_ASSETS: Record<
  string,
  {
    symbol: string;
    name: string;
    leverage: string;
    price: string;
    change24h: number;
    network?: string;
    high24h: string;
    low24h: string;
    volume24h: string;
    openInterest: string;
    fundingRate: string;
    fundingCountdown: string;
  }
> = {
  "1": {
    symbol: "BTC",
    name: "Bitcoin",
    leverage: "40x",
    price: "100,445.00",
    change24h: 5.6,
    network: "hyperliquid",
    high24h: "$104,483.00",
    low24h: "$98,895.00",
    volume24h: "$5.54B",
    openInterest: "$3.43B",
    fundingRate: "0.0013%",
    fundingCountdown: "00:42:22",
  },
  "1-hl": {
    symbol: "BTC",
    name: "Bitcoin",
    leverage: "40x",
    price: "100,245.00",
    change24h: 5.6,
    network: "hyperliquid",
    high24h: "$104,483.00",
    low24h: "$98,895.00",
    volume24h: "$5.54B",
    openInterest: "$3.43B",
    fundingRate: "0.0013%",
    fundingCountdown: "00:42:22",
  },
  "1-arb": {
    symbol: "BTC",
    name: "Bitcoin",
    leverage: "25x",
    price: "100,355.00",
    change24h: 2.7,
    network: "arbitrum",
    high24h: "$101,234.00",
    low24h: "$98,765.00",
    volume24h: "$11.62B",
    openInterest: "$2.15B",
    fundingRate: "0.0032%",
    fundingCountdown: "00:42:22",
  },
  "2": {
    symbol: "ETH",
    name: "Ethereum",
    leverage: "25x",
    price: "3,104.78",
    change24h: 4.71,
    network: "hyperliquid",
    high24h: "$3,256.00",
    low24h: "$2,987.00",
    volume24h: "$21.62B",
    openInterest: "$1.23B",
    fundingRate: "0.0038%",
    fundingCountdown: "00:42:22",
  },
  "3": {
    symbol: "SOL",
    name: "Solana",
    leverage: "20x",
    price: "138.53",
    change24h: 9.38,
    network: "hyperliquid",
    high24h: "$145.00",
    low24h: "$125.00",
    volume24h: "$512.33M",
    openInterest: "$456.21M",
    fundingRate: "0.0052%",
    fundingCountdown: "00:42:22",
  },
};

function OverviewTabContent({
  asset,
}: {
  asset: (typeof MOCK_ASSETS)[string];
}) {
  return (
    <Card>
      <CardSection position="first" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            24h low
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {asset.low24h}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            24h high
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {asset.high24h}
          </span>
        </div>
      </CardSection>
      <CardSection position="middle" className="flex gap-4">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            24h volume
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {asset.volume24h}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Open Interest
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {asset.openInterest}
          </span>
        </div>
      </CardSection>
      <CardSection position="last" className="flex flex-col gap-2.5">
        <span className="text-gray-2 text-xs font-semibold tracking-tight">
          Funding rate
        </span>
        <span className="text-white text-base font-semibold tracking-tight">
          <span className="text-accent-green">{asset.fundingRate}</span>{" "}
          <span className="font-normal">({asset.fundingCountdown})</span>
        </span>
      </CardSection>
    </Card>
  );
}

// Mock position data for the Position tab
const MOCK_POSITION_DATA = {
  symbol: "BTC",
  leverage: "60x",
  size: "0.50 BTC",
  value: "$45,910.75",
  pnl: "+$367.29",
  pnlPercent: "0.8%",
  entry: "$91,626",
  liqPrice: "$61,989",
  margin: "$6.74",
  takeProfit: "Not set",
  stopLoss: "Not set",
  funding: "$0.00",
};

function PositionTabContent({ positionId }: { positionId: string }) {
  const hasPosition = true; // In real app, check if user has position

  if (!hasPosition) {
    return (
      <Card>
        <CardSection
          position="only"
          className="flex flex-col items-center py-8"
        >
          <span className="text-gray-2 text-sm">No open positions</span>
        </CardSection>
      </Card>
    );
  }

  return (
    <Card>
      {/* Header Row - Symbol & PnL */}
      <CardSection position="first" className="flex gap-2 py-5">
        <div className="flex flex-1 flex-col gap-3">
          <span className="text-white text-base font-semibold tracking-tight">
            {MOCK_POSITION_DATA.symbol} {MOCK_POSITION_DATA.leverage}
          </span>
          <span className="text-gray-2 text-sm font-semibold tracking-tight">
            {MOCK_POSITION_DATA.size}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 items-end">
          <span className="text-white text-base font-semibold tracking-tight">
            {MOCK_POSITION_DATA.value}
          </span>
          <span className="text-accent-green text-sm font-semibold tracking-tight">
            {MOCK_POSITION_DATA.pnl}({MOCK_POSITION_DATA.pnlPercent})
          </span>
        </div>
      </CardSection>

      {/* Second Row - Entry, Liq. Price, Margin */}
      <CardSection position="middle" className="flex gap-4 py-5">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Entry
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {MOCK_POSITION_DATA.entry}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Liq. Price
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {MOCK_POSITION_DATA.liqPrice}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Margin
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {MOCK_POSITION_DATA.margin}
          </span>
        </div>
      </CardSection>

      {/* Third Row - Take profit, Stop loss, Funding */}
      <CardSection position="middle" className="flex gap-4 py-5">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Take profit
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {MOCK_POSITION_DATA.takeProfit}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Stop loss
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {MOCK_POSITION_DATA.stopLoss}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Funding
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {MOCK_POSITION_DATA.funding}
          </span>
        </div>
      </CardSection>

      {/* Bottom Row - Action Buttons */}
      <CardSection position="last" className="flex gap-4 p-4">
        <Button
          variant="secondary"
          className="flex-1 h-[42px] bg-[#212121] hover:bg-[#2a2a2a] text-white rounded-[10px] text-base font-semibold"
        >
          Edit TP/SL
        </Button>
        <Link
          to="/position-details/$positionId/close"
          params={{ positionId }}
          className="flex-1"
        >
          <Button
            variant="secondary"
            className="w-full h-[42px] bg-[#212121] hover:bg-[#2a2a2a] text-white rounded-[10px] text-base font-semibold"
          >
            Close position
          </Button>
        </Link>
      </CardSection>
    </Card>
  );
}

function OrdersTabContent() {
  return (
    <Card>
      <CardSection position="only" className="flex flex-col items-center py-8">
        <span className="text-gray-2 text-sm">No open orders</span>
      </CardSection>
    </Card>
  );
}

export function PositionDetails() {
  const { positionId } = useParams({ from: "/position-details/$positionId/" });
  const [activeTab, setActiveTab] = useState("overview");

  // Get asset data (fallback to BTC if not found)
  const asset = MOCK_ASSETS[positionId] || MOCK_ASSETS["1"];
  const logo = CRYPTO_LOGOS[asset.symbol] || CRYPTO_LOGOS.BTC;
  const networkLogo = asset.network ? NETWORK_LOGOS[asset.network] : null;
  const isPositive = asset.change24h >= 0;

  return (
    <div className="flex flex-col gap-28">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-4">
          <Link to="/" className="flex items-center justify-center shrink-0">
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="relative shrink-0 size-9">
            <img
              src={logo}
              alt={asset.symbol}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="text-white font-semibold text-base tracking-tight">
                {asset.symbol}
              </span>
              <span className="bg-white/25 px-1.5 py-1 rounded-[5px] text-[11px] text-white leading-none">
                {asset.leverage}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-2 font-semibold text-sm tracking-tight">
                ${asset.price}
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
          {networkLogo && (
            <div className="size-8 rounded-full overflow-hidden shrink-0">
              <img
                src={networkLogo}
                alt={asset.network}
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Chart Placeholder */}
        <div className="pt-4">
          <Chart />
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as string)}
          className="gap-2.5"
        >
          <TabsList variant="contained">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="position">Position</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-2.5">
            <OverviewTabContent asset={asset} />
          </TabsContent>
          <TabsContent value="position" className="pt-2.5">
            <PositionTabContent positionId={positionId} />
          </TabsContent>
          <TabsContent value="orders" className="pt-2.5">
            <OrdersTabContent />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Buttons  */}
      <div className="bottom-0 left-0 right-0 bg-[#090909] border-t border-[#515151] pt-5">
        <div className="flex gap-4 max-w-[393px] mx-auto">
          <Link
            to="/position-details/$positionId/order"
            params={{ positionId }}
            search={{ side: "long" }}
            className="flex-1"
          >
            <Button className="w-full h-14 bg-accent-green text-black hover:bg-accent-green/90">
              Long
            </Button>
          </Link>
          <Link
            to="/position-details/$positionId/order"
            params={{ positionId }}
            search={{ side: "short" }}
            className="flex-1"
          >
            <Button className="w-full h-14 bg-accent-red text-white hover:bg-accent-red/90">
              Short
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default PositionDetails;
