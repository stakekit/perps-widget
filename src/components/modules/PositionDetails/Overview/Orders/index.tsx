import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Navigate } from "@tanstack/react-router";
import { cancelOrderAtom } from "@/atoms/orders-pending-actions-atom";
import { ordersAtom } from "@/atoms/portfolio-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { Button } from "@/components/ui/button";
import { Card, CardSection } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet";
import { useOrderActions } from "@/hooks/use-order-actions";
import { formatAmount, formatDate, formatSnakeCase } from "@/lib/utils";
import type { MarketDto, OrderDto } from "@/services/api-client/client-factory";

function OrderCard({
  order,
  market,
  wallet,
}: {
  order: OrderDto;
  market: MarketDto;
  wallet: WalletConnected;
}) {
  const price = order.limitPrice ?? order.triggerPrice ?? 0;
  const sizeNum = Number.parseFloat(order.size);
  const value = price * sizeNum;

  const { cancelOrderAction } = useOrderActions(order);

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
            {order.size} {market.baseAsset.symbol}
          </span>
        </div>
      </CardSection>

      {/* Bottom section with prices */}
      <CardSection
        position={cancelOrderAction ? "middle" : "last"}
        className="flex items-start gap-4"
      >
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
            {formatAmount(market.markPrice)}
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

      {/* Cancel button section */}
      {cancelOrderAction && (
        <CancelOrder
          wallet={wallet}
          marketId={cancelOrderAction.args.marketId}
          cancelOrderId={cancelOrderAction.args.orderId}
        />
      )}
    </Card>
  );
}

const CancelOrder = ({
  marketId,
  wallet,
  cancelOrderId,
}: {
  marketId: string;
  wallet: WalletConnected;
  cancelOrderId: string;
}) => {
  const cancelOrderResult = useAtomValue(cancelOrderAtom(cancelOrderId));
  const submitCancelOrder = useAtomSet(cancelOrderAtom(cancelOrderId));

  const handleCancelOrder = () => submitCancelOrder({ marketId, wallet });

  return (
    <>
      <CardSection position="last">
        <Button
          variant="destructive"
          className="w-full"
          onClick={() => handleCancelOrder()}
          loading={Result.isWaiting(cancelOrderResult)}
          disabled={Result.isWaiting(cancelOrderResult)}
        >
          Cancel Order
        </Button>
      </CardSection>

      {/* Navigate to sign route on successful submit */}
      {Result.isSuccess(cancelOrderResult) && (
        <Navigate
          to="/position-details/$marketId/cancel-order/sign"
          params={{ marketId }}
        />
      )}
    </>
  );
};

function OrdersTabContentWithWallet({
  wallet,
  market,
}: {
  wallet: WalletConnected;
  market: MarketDto;
}) {
  const ordersResult = useAtomValue(ordersAtom(wallet));

  if (Result.isInitial(ordersResult)) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

  const orders = ordersResult.pipe(
    Result.map((allOrders) =>
      allOrders.filter((o) => o.marketId === market.id),
    ),
    Result.getOrElse(() => [] as OrderDto[]),
  );

  if (orders.length === 0) {
    return (
      <Card>
        <CardSection
          position="only"
          className="flex flex-col items-center py-8"
        >
          <span className="text-gray-2 text-sm">
            No open orders for this market
          </span>
        </CardSection>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {orders.map((order, idx) => (
        <OrderCard
          key={`${order.marketId}-${order.createdAt}-${idx}`}
          order={order}
          market={market}
          wallet={wallet}
        />
      ))}
    </div>
  );
}

export function OrdersTabContent({ market }: { market: MarketDto }) {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  if (!isWalletConnected(wallet)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-foreground font-semibold text-base">
          Wallet not connected
        </p>
        <p className="text-gray-1 text-sm text-center">
          Connect your wallet to see your orders
        </p>
      </div>
    );
  }

  return <OrdersTabContentWithWallet wallet={wallet} market={market} />;
}
