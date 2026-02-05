import { type AtomRef, useAtomRef } from "@effect-atom/atom-react";
import { Link } from "@tanstack/react-router";
import { Card, CardSection, Text } from "@yieldxyz/perps-common/components";
import {
  calcNotionalUsd,
  formatAmount,
  formatDate,
  formatSnakeCase,
} from "@yieldxyz/perps-common/lib";
import type { ApiSchemas } from "@yieldxyz/perps-common/services";

export function OrderCard({
  order,
  marketRef,
}: {
  order: ApiSchemas.OrderDto;
  marketRef: AtomRef.AtomRef<ApiSchemas.MarketDto>;
}) {
  const market = useAtomRef(marketRef);
  const price = order.limitPrice ?? order.triggerPrice ?? 0;
  const value = calcNotionalUsd({ priceUsd: price, sizeBase: order.size });

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
            <Text as="span" variant="labelBaseWhite">
              {formatSnakeCase(order.type)}
            </Text>
            <Text as="span" variant="labelSmGray2Tight">
              {formatDate(order.createdAt)}
            </Text>
          </div>

          {/* Value and size */}
          <div className="flex flex-col items-end justify-center gap-2.5">
            <Text as="span" variant="labelBaseWhite">
              {formatAmount(value)}
            </Text>
            <Text as="span" variant="labelSmGray2Tight">
              {order.size} {market?.baseAsset.symbol ?? ""}
            </Text>
          </div>
        </CardSection>

        {/* Bottom section with prices */}
        <CardSection position="last" className="flex items-start gap-4">
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <Text as="span" variant="labelXsGray2">
              {order.limitPrice ? "Limit" : "Trigger"}
            </Text>
            <Text as="span" variant="labelBaseWhite">
              {formatAmount(price)}
            </Text>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <Text as="span" variant="labelXsGray2">
              Market
            </Text>
            <Text as="span" variant="labelBaseWhite">
              {market ? formatAmount(market.markPrice) : "-"}
            </Text>
          </div>
          <div className="flex-1 flex flex-col gap-2.5 items-start justify-center">
            <Text as="span" variant="labelXsGray2">
              Side
            </Text>
            <Text
              as="span"
              variant="labelBase"
              className={
                order.side === "long" ? "text-accent-green" : "text-accent-red"
              }
            >
              {order.side === "long" ? "Long" : "Short"}
            </Text>
          </div>
        </CardSection>
      </Card>
    </Link>
  );
}
