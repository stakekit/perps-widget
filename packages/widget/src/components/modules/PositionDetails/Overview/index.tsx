import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Link, useParams, useSearch } from "@tanstack/react-router";
import hyperliquidLogo from "@yieldxyz/perps-common/assets/hyperliquid.png";
import {
  marketAtom,
  positionsAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  Button,
  Chart,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  TokenIcon,
} from "@yieldxyz/perps-common/components";
import {
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import {
  formatAmount,
  formatPercentage,
  getMaxLeverage,
  getTokenLogo,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { useState } from "react";
import { BackButton } from "../../../molecules/navigation/back-button";
import { PositionDetailsLoading } from "./loading";
import { ModifyDialog } from "./modify-dialog";
import { OrdersTabContent } from "./Orders";
import { OverviewTabContent } from "./overview-tab-content";
import { PositionTabContent } from "./Position";

function BottomButtonsWithWallet({
  wallet,
  market,
}: {
  wallet: WalletConnected;
  market: ApiTypes.MarketDto;
}) {
  const positionsResult = useAtomValue(
    positionsAtom(wallet.currentAccount.address),
  );

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
  market: ApiTypes.MarketDto;
  position?: ApiTypes.PositionDto;
}) {
  return (
    <div className="bottom-0 left-0 right-0 bg-surface-3 border-t border-[#515151] pt-5">
      <div className="flex gap-4 max-w-[393px] mx-auto">
        {!position ? (
          <>
            <Link
              to="/order/$marketId/$side"
              params={{ marketId: market.id, side: "long" }}
              className="flex-1"
            >
              <Button size="lg" variant="accentGreen" className="w-full">
                Long
              </Button>
            </Link>
            <Link
              to="/order/$marketId/$side"
              params={{ marketId: market.id, side: "short" }}
              className="flex-1"
            >
              <Button
                size="lg"
                className="w-full bg-accent-red text-white hover:bg-accent-red/90"
              >
                Short
              </Button>
            </Link>
          </>
        ) : (
          <ModifyDialog marketId={market.id} side={position.side} />
        )}
      </div>
    </div>
  );
}

function BottomButtons({ market }: { market: ApiTypes.MarketDto }) {
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
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
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
              <Text as="span" variant="labelBaseWhite">
                {symbol}
              </Text>
              <Text as="span" variant="badgeWhiteSmall">
                {maxLeverage}x
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Text as="span" variant="labelSmGray2Tight">
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
        </div>

        {/* Chart Placeholder */}
        <div className="pt-4">
          <Chart symbol={market.baseAsset.symbol} variant="widget" />
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

  if (Result.isInitial(marketRef)) {
    return <PositionDetailsLoading />;
  }

  if (!Result.isSuccess(marketRef)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Text as="p" variant="headingBase">
          Market not found
        </Text>
        <Text as="p" variant="helperSmGray1" className="text-center">
          The market you're looking for doesn't exist
        </Text>
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
