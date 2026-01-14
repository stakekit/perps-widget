import { Result, useAtomValue } from "@effect-atom/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { Array as _Array, Option, Record } from "effect";
import { useState } from "react";
import hyperliquidLogo from "@/assets/hyperliquid.png";
import { marketsAtom } from "@/atoms/markets-atoms";
import {
  ordersAtom,
  positionsAtom,
  selectedProviderBalancesAtom,
} from "@/atoms/portfolio-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { TokenIcon } from "@/components/molecules/token-icon";
import { Card, CardSection } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { WalletConnected } from "@/domain/wallet";
import {
  formatAmount,
  formatDate,
  formatPercentage,
  formatSnakeCase,
  getTokenLogo,
} from "@/lib/utils";
import type {
  MarketDto,
  OrderDto,
  PositionDto,
} from "@/services/api-client/client-factory";

interface OrderCardProps {
  order: OrderDto;
  market: MarketDto | undefined;
}

function OrderCard({ order, market }: OrderCardProps) {
  const price = order.limitPrice ?? order.triggerPrice ?? 0;
  const sizeNum = Number.parseFloat(order.size);
  const value = price * sizeNum;

  return (
    <Card>
      {/* Top section with order type and value */}
      <CardSection position="first" className="flex items-center gap-2">
        {/* Order info */}
        <div className="flex-1 flex flex-col gap-2.5 items-start justify-center min-w-0">
          <span className="text-white font-semibold text-base tracking-tight">
            {formatSnakeCase(order.type)}
          </span>
          <span className="text-gray-2 font-semibold text-sm tracking-tight">
            {formatDate(order.createdAt)}
          </span>
        </div>

        {/* Value and size */}
        <div className="flex flex-col items-end justify-center gap-2.5">
          <span className="text-white font-semibold text-base tracking-tight">
            {formatAmount(value)}
          </span>
          <span className="text-gray-2 font-semibold text-sm tracking-tight">
            {order.size} {market?.baseAsset.symbol ?? ""}
          </span>
        </div>
      </CardSection>

      {/* Bottom section with prices */}
      <CardSection position="last" className="flex items-start gap-4">
        <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
          <span className="text-gray-2 font-semibold text-xs tracking-tight">
            {order.limitPrice ? "Limit" : "Trigger"}
          </span>
          <span className="text-white font-semibold text-base tracking-tight">
            {formatAmount(price)}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
          <span className="text-gray-2 font-semibold text-xs tracking-tight">
            Market
          </span>
          <span className="text-white font-semibold text-base tracking-tight">
            {market ? formatAmount(market.markPrice) : "-"}
          </span>
        </div>
        <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
          <span className="text-gray-2 font-semibold text-xs tracking-tight">
            Side
          </span>
          <span
            className={`font-semibold text-base tracking-tight ${
              order.side === "long" ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {order.side === "long" ? "Long" : "Short"}
          </span>
        </div>
      </CardSection>
    </Card>
  );
}

interface PositionCardProps {
  position: PositionDto;
  market: MarketDto;
}

function PositionCard({ position, market }: PositionCardProps) {
  const navigate = useNavigate();
  const symbol = market.baseAsset.symbol;
  const name = market.baseAsset.name;
  const logo = market.baseAsset.logoURI ?? getTokenLogo(symbol);

  const pnlPercent =
    position.margin > 0 ? (position.unrealizedPnl / position.margin) * 100 : 0;

  const isPnlPositive = position.unrealizedPnl >= 0;

  const handleClick = () =>
    navigate({
      to: "/position-details/$marketId",
      params: { marketId: position.marketId },
    });

  return (
    <button type="button" onClick={handleClick} className="w-full text-left">
      <Card>
        {/* Top section with token info and price */}
        <CardSection position="first" className="p-4 flex items-center gap-2">
          {/* Token icon with badge */}
          <div className="relative shrink-0 size-9">
            <TokenIcon logoURI={logo} name={symbol} />
            <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-background overflow-hidden">
              <img
                src={hyperliquidLogo}
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Token info */}
          <div className="flex-1 flex flex-col gap-2 items-start justify-center min-w-0">
            <div className="flex items-center gap-2.5">
              <span className="text-white font-semibold text-base tracking-tight">
                {symbol}
              </span>
              <span
                className={`px-1.5 py-1 rounded text-[11px] text-white text-center leading-tight ${
                  position.side === "long"
                    ? "bg-accent-green/30"
                    : "bg-accent-red/30"
                }`}
              >
                {position.leverage}x{" "}
                {position.side === "long" ? "Long" : "Short"}
              </span>
            </div>
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              {name}
            </span>
          </div>

          {/* PnL */}
          <div className="flex flex-col items-end justify-center gap-2.5">
            <span
              className={`font-semibold text-base tracking-tight ${
                isPnlPositive ? "text-accent-green" : "text-accent-red"
              }`}
            >
              {isPnlPositive ? "+" : ""}
              {formatAmount(position.unrealizedPnl)}
            </span>
            <span
              className={`font-semibold text-xs tracking-tight ${
                isPnlPositive ? "text-accent-green" : "text-accent-red"
              }`}
            >
              {isPnlPositive ? "+" : ""}
              {formatPercentage(pnlPercent)}
            </span>
          </div>
        </CardSection>

        {/* Bottom section with entry/market/liq prices */}
        <CardSection position="last" className="flex items-start gap-4">
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              Entry
            </span>
            <span className="text-white font-semibold text-base tracking-tight">
              {formatAmount(position.entryPrice)}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              Mark
            </span>
            <span className="text-white font-semibold text-base tracking-tight">
              {formatAmount(position.markPrice)}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              Liq. Price
            </span>
            <span className="text-white font-semibold text-base tracking-tight">
              {formatAmount(position.liquidationPrice)}
            </span>
          </div>
        </CardSection>
      </Card>
    </button>
  );
}

function PositionsWithWallet({ wallet }: { wallet: WalletConnected }) {
  const [activeTab, setActiveTab] = useState<"positions" | "orders">(
    "positions",
  );

  const positionsResult = useAtomValue(positionsAtom(wallet));
  const ordersResult = useAtomValue(ordersAtom(wallet));
  const marketsResult = useAtomValue(marketsAtom);
  const balancesResult = useAtomValue(selectedProviderBalancesAtom(wallet));

  const marketsMap = marketsResult.pipe(
    Result.map((markets) => Record.fromIterableBy(markets, (m) => m.id)),
    Result.getOrElse(() => ({}) as Record<string, MarketDto>),
  );

  // Calculate totals from positions
  const totals = Result.all({
    positions: positionsResult,
    balances: balancesResult,
  }).pipe(
    Result.map(({ positions, balances }) => {
      const totalUnrealizedPnl = positions.reduce(
        (acc, p) => acc + p.unrealizedPnl,
        0,
      );
      const totalMargin = positions.reduce((acc, p) => acc + p.margin, 0);
      const pnlPercent =
        totalMargin > 0 ? (totalUnrealizedPnl / totalMargin) * 100 : 0;

      return {
        accountValue: balances.accountValue,
        unrealizedPnl: totalUnrealizedPnl,
        pnlPercent,
      };
    }),
  );

  const isLoading =
    Result.isWaiting(positionsResult) ||
    Result.isWaiting(ordersResult) ||
    Result.isWaiting(marketsResult);

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 w-full">
        <div className="flex items-center justify-between pb-5">
          <Skeleton className="h-9 w-32" />
          <div className="flex flex-col items-end gap-2.5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-5 w-16" />
          </div>
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
        <div className="flex flex-col gap-2 pt-5">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      </div>
    );
  }

  const positionsWithMarket = positionsResult.pipe(
    Result.map((positions) =>
      _Array.filterMap(positions, (p) =>
        Record.get(marketsMap, p.marketId).pipe(
          Option.map((m) => ({ market: m, position: p })),
        ),
      ),
    ),
    Result.getOrElse(() => []),
  );
  const ordersWithMarket = ordersResult.pipe(
    Result.map((orders) =>
      _Array.filterMap(orders, (o) =>
        Record.get(marketsMap, o.marketId).pipe(
          Option.map((m) => ({ market: m, order: o })),
        ),
      ),
    ),
    Result.getOrElse(() => []),
  );
  const totalsData = totals.pipe(Result.getOrElse(() => null));

  if (!totalsData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-foreground font-semibold text-base">
          Unable to load data
        </p>
        <p className="text-gray-1 text-sm text-center">
          Please try again later
        </p>
      </div>
    );
  }

  const isPnlPositive = totalsData.pnlPercent >= 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Total value section */}
      <div className="flex items-center justify-between pb-5">
        <span className="text-white font-semibold text-[30px] tracking-tight leading-tight">
          {formatAmount(totalsData.accountValue)}
        </span>
        <div className="flex flex-col items-end justify-center gap-2.5">
          <span
            className={`font-semibold text-sm tracking-tight ${
              isPnlPositive ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {isPnlPositive ? "+" : ""}
            {formatAmount(totalsData.unrealizedPnl)}
          </span>
          <span
            className={`font-semibold text-sm tracking-tight ${
              isPnlPositive ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {isPnlPositive ? "+" : ""}
            {formatPercentage(totalsData.pnlPercent)}
          </span>
        </div>
      </div>

      {/* Positions/Orders tabs */}
      <div className="bg-[#121314] h-12 p-[5px] rounded-xl flex gap-[5px]">
        <button
          type="button"
          onClick={() => setActiveTab("positions")}
          className={`flex-1 h-[36px] rounded-xl flex items-center justify-center font-semibold text-sm tracking-tight transition-colors ${
            activeTab === "positions"
              ? "bg-white text-black border border-white"
              : "bg-transparent text-gray-2 hover:text-white"
          }`}
        >
          Positions ({positionsWithMarket.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("orders")}
          className={`flex-1 h-[36px] rounded-xl flex items-center justify-center font-semibold text-sm tracking-tight transition-colors ${
            activeTab === "orders"
              ? "bg-white text-black border border-white"
              : "bg-transparent text-gray-2 hover:text-white"
          }`}
        >
          Orders ({ordersWithMarket.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 pt-5">
        {activeTab === "positions" ? (
          positionsWithMarket.length > 0 ? (
            positionsWithMarket.map(({ market, position }) => (
              <PositionCard
                key={position.marketId}
                position={position}
                market={market}
              />
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <p className="text-foreground font-semibold text-base">
                No open positions
              </p>
              <p className="text-gray-1 text-sm text-center">
                Start trading to see your positions here
              </p>
            </div>
          )
        ) : ordersWithMarket.length > 0 ? (
          ordersWithMarket.map(({ market, order }, idx) => (
            <OrderCard
              key={`${order.marketId}-${order.createdAt}-${idx}`}
              order={order}
              market={market}
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <p className="text-foreground font-semibold text-base">
              No open orders
            </p>
            <p className="text-gray-1 text-sm text-center">
              Your pending orders will appear here
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export function Positions() {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  if (!wallet || wallet.status !== "connected") {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-foreground font-semibold text-base">
          Wallet not connected
        </p>
        <p className="text-gray-1 text-sm text-center">
          Connect your wallet to see your positions
        </p>
      </div>
    );
  }

  return <PositionsWithWallet wallet={wallet} />;
}
