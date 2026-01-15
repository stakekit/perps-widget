import { useNavigate } from "@tanstack/react-router";
import hyperliquidLogo from "@/assets/hyperliquid.png";
import { TokenIcon } from "@/components/molecules/token-icon";
import { Card, CardSection } from "@/components/ui/card";
import { useTpSlOrders } from "@/hooks/use-tp-sl-orders";
import { formatAmount, formatPercentage, getTokenLogo } from "@/lib/utils";
import type {
  MarketDto,
  OrderDto,
  PositionDto,
} from "@/services/api-client/api-schemas";

export function PositionCard({
  position,
  market,
  orders,
}: {
  position: PositionDto;
  market: MarketDto;
  orders: OrderDto[];
}) {
  const navigate = useNavigate();
  const symbol = market.baseAsset.symbol;
  const logo = market.baseAsset.logoURI ?? getTokenLogo(symbol);

  const sizeNum = Number.parseFloat(position.size);
  const value = position.markPrice * sizeNum;
  const pnlPercent =
    position.margin > 0 ? (position.unrealizedPnl / position.margin) * 100 : 0;

  const { stopLoss, takeProfit } = useTpSlOrders(orders);

  const isPnlPositive = position.unrealizedPnl >= 0;

  const handleClick = () =>
    navigate({
      to: "/position-details/$marketId",
      params: { marketId: position.marketId },
      search: { tab: "position" },
      mask: {
        to: "/position-details/$marketId",
        params: { marketId: position.marketId },
        search: {},
      },
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
              {position.size} {symbol} · {formatAmount(value)}
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

        {/* Middle section with entry/market/liq prices */}
        <CardSection position="middle" className="flex items-start gap-4">
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

        {/* Bottom section with margin, TP, SL */}
        <CardSection position="last" className="flex items-start gap-4">
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              Margin
            </span>
            <span className="text-white font-semibold text-base tracking-tight">
              {formatAmount(position.margin)}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              Take Profit
            </span>
            <span className="text-white font-semibold text-base tracking-tight">
              {takeProfit?.triggerPrice
                ? formatAmount(takeProfit.triggerPrice)
                : "Not set"}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <span className="text-gray-2 font-semibold text-xs tracking-tight">
              Stop Loss
            </span>
            <span className="text-white font-semibold text-base tracking-tight">
              {stopLoss?.triggerPrice
                ? formatAmount(stopLoss.triggerPrice)
                : "Not set"}
            </span>
          </div>
        </CardSection>
      </Card>
    </button>
  );
}
