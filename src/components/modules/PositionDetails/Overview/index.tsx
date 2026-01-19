import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import { useState } from "react";
import hyperliquidLogo from "@/assets/hyperliquid.png";
import { marketAtom } from "@/atoms/markets-atoms";
import { positionsAtom } from "@/atoms/portfolio-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import Chart from "@/components/modules/PositionDetails/Overview/chart";
import { PositionDetailsLoading } from "@/components/modules/PositionDetails/Overview/loading";
import { OrdersTabContent } from "@/components/modules/PositionDetails/Overview/Orders";
import { OverviewTabContent } from "@/components/modules/PositionDetails/Overview/overview-tab-content";
import { PositionTabContent } from "@/components/modules/PositionDetails/Overview/Position";
import { BackButton } from "@/components/molecules/navigation/back-button";
import { TokenIcon } from "@/components/molecules/token-icon";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMaxLeverage } from "@/domain/market";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet";
import { formatAmount, formatPercentage, getTokenLogo } from "@/lib/utils";
import type {
  MarketDto,
  PositionDto,
} from "@/services/api-client/client-factory";

function BottomButtonsWithWallet({
  wallet,
  market,
}: {
  wallet: WalletConnected;
  market: MarketDto;
}) {
  const positionsResult = useAtomValue(positionsAtom(wallet));

  const position = positionsResult.pipe(
    Result.map((positions) => positions.find((p) => p.marketId === market.id)),
    Result.getOrElse(() => undefined),
  );

  return <BottomButtonsContent market={market} position={position} />;
}

function BottomButtonsContent({
  market,
  position,
}: {
  market: MarketDto;
  position?: PositionDto;
}) {
  const showLong = !position || position.side === "long";
  const showShort = !position || position.side === "short";

  return (
    <div className="bottom-0 left-0 right-0 bg-[#090909] border-t border-[#515151] pt-5">
      <div className="flex gap-4 max-w-[393px] mx-auto">
        {showLong && (
          <Link
            to="/order/$marketId/$side"
            params={{ marketId: market.id, side: "long" }}
            className="flex-1"
          >
            <Button variant="accentGreen" className="w-full h-14">
              Long
            </Button>
          </Link>
        )}
        {showShort && (
          <Link
            to="/order/$marketId/$side"
            params={{ marketId: market.id, side: "short" }}
            className="flex-1"
          >
            <Button className="w-full h-14 bg-accent-red text-white hover:bg-accent-red/90">
              Short
            </Button>
          </Link>
        )}
      </div>
    </div>
  );
}

function BottomButtons({ market }: { market: MarketDto }) {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  if (!isWalletConnected(wallet)) {
    // No wallet connected - show both buttons
    return <BottomButtonsContent market={market} />;
  }

  return <BottomButtonsWithWallet wallet={wallet} market={market} />;
}

function PositionDetailsContent({
  marketRef,
  initialTab,
}: {
  marketRef: AtomRef.AtomRef<MarketDto>;
  initialTab?: "overview" | "position" | "orders";
}) {
  const market = useAtomRef(marketRef);
  const [activeTab, setActiveTab] = useState(initialTab ?? "overview");

  const symbol = market.baseAsset.symbol;
  const logo = market.baseAsset.logoURI ?? getTokenLogo(symbol);
  const maxLeverage = getMaxLeverage(market.leverageRange);
  const isPositive = market.priceChangePercent24h >= 0;

  return (
    <div className="flex flex-col gap-8">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-4">
          <BackButton />
          <div className="relative shrink-0 size-9">
            <TokenIcon logoURI={logo} name={symbol} />
            <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-background overflow-hidden">
              <img
                src={hyperliquidLogo}
                alt="Hyperliquid"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="text-white font-semibold text-base tracking-tight">
                {symbol}
              </span>
              <span className="bg-white/25 px-1.5 py-1 rounded-[5px] text-[11px] text-white leading-none">
                {maxLeverage}x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-2 font-semibold text-sm tracking-tight">
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
        </div>

        {/* Chart Placeholder */}
        <div className="pt-4">
          <Chart symbol={market.baseAsset.symbol} />
        </div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "overview" | "position" | "orders")
          }
          className="gap-2.5"
        >
          <TabsList variant="contained">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="position">Position</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="pt-2.5">
            <OverviewTabContent market={market} />
          </TabsContent>
          <TabsContent value="position" className="pt-2.5">
            <PositionTabContent market={market} />
          </TabsContent>
          <TabsContent value="orders" className="pt-2.5">
            <OrdersTabContent market={market} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Bottom Buttons  */}
      <BottomButtons market={market} />
    </div>
  );
}

export function PositionDetails() {
  const { marketId } = useParams({ from: "/position-details/$marketId/" });
  const { tab } = useSearch({ from: "/position-details/$marketId/" });

  const marketRef = useAtomValue(marketAtom(marketId));

  if (Result.isWaiting(marketRef)) {
    return <PositionDetailsLoading />;
  }

  if (!Result.isSuccess(marketRef)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-foreground font-semibold text-base">
          Market not found
        </p>
        <p className="text-gray-1 text-sm text-center">
          The market you're looking for doesn't exist
        </p>
        <Link to="/">
          <Button variant="secondary">Back to Home</Button>
        </Link>
      </div>
    );
  }

  return (
    <PositionDetailsContent marketRef={marketRef.value} initialTab={tab} />
  );
}

export default PositionDetails;
