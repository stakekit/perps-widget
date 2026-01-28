import { type AtomRef, useAtomRef } from "@effect-atom/atom-react";
import { Link } from "@tanstack/react-router";
import { Card, CardSection } from "@/components/ui/card";
import { formatAmount, formatDate, formatSnakeCase } from "@/lib/utils";
import type { MarketDto, OrderDto } from "@/services/api-client/api-schemas";

export function OrderCard({
  order,
  marketRef,
}: {
  order: OrderDto;
  marketRef: AtomRef.AtomRef<MarketDto>;
}) {
  const market = useAtomRef(marketRef);
  const price = order.limitPrice ?? order.triggerPrice ?? 0;
  const value = price * Number.parseFloat(order.size);

  return (
    <Link
      to="/position-details/$marketId"
      params={{ marketId: market.id }}
      search={{ tab: "orders" }}
      mask={{
        to: "/position-details/$marketId",
        params: { marketId: market.id },
        search: {},
      }}
      className="hover:bg-white/2.5 rounded-2xl"
    >
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
              {value}
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
    </Link>
  );
}
