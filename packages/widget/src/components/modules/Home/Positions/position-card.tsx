import { type AtomRef, useAtomRef } from "@effect-atom/atom-react";
import { Link } from "@tanstack/react-router";
import hyperliquidLogo from "@yieldxyz/perps-common/assets/hyperliquid.png";
import {
  Card,
  CardSection,
  Text,
  TokenIcon,
} from "@yieldxyz/perps-common/components";
import { useTpSlOrders } from "@yieldxyz/perps-common/hooks";
import {
  calcNotionalUsd,
  calcPnlPercent,
  formatAmount,
  formatPercentage,
  getTokenLogo,
} from "@yieldxyz/perps-common/lib";
import type { ApiSchemas } from "@yieldxyz/perps-common/services";

export function PositionCard({
  positionRef,
  marketRef,
  orders,
}: {
  positionRef: AtomRef.AtomRef<ApiSchemas.PositionDto>;
  marketRef: AtomRef.AtomRef<ApiSchemas.MarketDto>;
  orders: ApiSchemas.OrderDto[];
}) {
  const position = useAtomRef(positionRef);
  const market = useAtomRef(marketRef);
  const symbol = market.baseAsset.symbol;
  const logo = market.baseAsset.logoURI ?? getTokenLogo(symbol);

  const value = calcNotionalUsd({
    priceUsd: position.markPrice,
    sizeBase: position.size,
  });
  const pnlPercent = calcPnlPercent({
    pnlUsd: position.unrealizedPnl,
    marginUsd: position.margin,
  });

  const { stopLoss, takeProfit } = useTpSlOrders(orders);

  const isPnlPositive = position.unrealizedPnl >= 0;

  return (
    <Link
      to="/position-details/$marketId"
      params={{ marketId: position.marketId }}
      search={{ tab: "position" }}
      mask={{
        to: "/position-details/$marketId",
        params: { marketId: position.marketId },
        search: {},
      }}
      className="w-full text-left hover:bg-white/2.5 rounded-2xl"
    >
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
              <Text as="span" variant="labelBaseWhite">
                {symbol}
              </Text>
              <Text
                as="span"
                variant="badgeSideTight"
                className={
                  position.side === "long"
                    ? "bg-accent-green/30"
                    : "bg-accent-red/30"
                }
              >
                {position.leverage}x{" "}
                {position.side === "long" ? "Long" : "Short"}
              </Text>
            </div>
            <Text as="span" variant="labelXsGray2">
              {position.size} {symbol} · {formatAmount(value)}
            </Text>
          </div>

          {/* PnL */}
          <div className="flex flex-col items-end justify-center gap-2.5">
            <Text
              as="span"
              variant="labelBase"
              className={
                isPnlPositive ? "text-accent-green" : "text-accent-red"
              }
            >
              {isPnlPositive ? "+" : ""}
              {formatAmount(position.unrealizedPnl)}
            </Text>
            <Text
              as="span"
              variant="labelXs"
              className={
                isPnlPositive ? "text-accent-green" : "text-accent-red"
              }
            >
              {isPnlPositive ? "+" : ""}
              {formatPercentage(pnlPercent)}
            </Text>
          </div>
        </CardSection>

        {/* Middle section with entry/market/liq prices */}
        <CardSection position="middle" className="flex items-start gap-4">
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <Text as="span" variant="labelXsGray2">
              Entry
            </Text>
            <Text as="span" variant="labelBaseWhite">
              {formatAmount(position.entryPrice)}
            </Text>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <Text as="span" variant="labelXsGray2">
              Mark
            </Text>
            <Text as="span" variant="labelBaseWhite">
              {formatAmount(position.markPrice)}
            </Text>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <Text as="span" variant="labelXsGray2">
              Liq. Price
            </Text>
            <Text as="span" variant="labelBaseWhite">
              {formatAmount(position.liquidationPrice)}
            </Text>
          </div>
        </CardSection>

        {/* Bottom section with margin, TP, SL */}
        <CardSection position="last" className="flex items-start gap-4">
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <Text as="span" variant="labelXsGray2">
              Margin
            </Text>
            <Text as="span" variant="labelBaseWhite">
              {formatAmount(position.margin)}
            </Text>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <Text as="span" variant="labelXsGray2">
              Take Profit
            </Text>
            <Text as="span" variant="labelBaseWhite">
              {takeProfit?.triggerPrice
                ? formatAmount(takeProfit.triggerPrice)
                : "Not set"}
            </Text>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <Text as="span" variant="labelXsGray2">
              Stop Loss
            </Text>
            <Text as="span" variant="labelBaseWhite">
              {stopLoss?.triggerPrice
                ? formatAmount(stopLoss.triggerPrice)
                : "Not set"}
            </Text>
          </div>
        </CardSection>
      </Card>
    </Link>
  );
}
