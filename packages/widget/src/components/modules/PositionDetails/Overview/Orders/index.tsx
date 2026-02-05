import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { Navigate } from "@tanstack/react-router";
import {
  cancelOrderAtom,
  ordersAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  Button,
  Card,
  CardSection,
  Skeleton,
  Text,
} from "@yieldxyz/perps-common/components";
import {
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import { useOrderActions } from "@yieldxyz/perps-common/hooks";
import {
  calcNotionalUsd,
  formatAmount,
  formatDate,
  formatSnakeCase,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";

function OrderCard({
  order,
  market,
  wallet,
}: {
  order: ApiTypes.OrderDto;
  market: ApiTypes.MarketDto;
  wallet: WalletConnected;
}) {
  const price = order.limitPrice ?? order.triggerPrice ?? 0;
  const value = calcNotionalUsd({ priceUsd: price, sizeBase: order.size });

  const { cancelOrderAction } = useOrderActions(order);

  return (
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
            {order.size} {market.baseAsset.symbol}
          </Text>
        </div>
      </CardSection>

      {/* Bottom section with prices */}
      <CardSection
        position={cancelOrderAction ? "middle" : "last"}
        className="flex items-start gap-4"
      >
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
            {formatAmount(market.markPrice)}
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

  const handleCancelOrder = () =>
    submitCancelOrder({
      marketId,
      walletAddress: wallet.currentAccount.address,
    });

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
  market: ApiTypes.MarketDto;
}) {
  const ordersResult = useAtomValue(ordersAtom(wallet.currentAccount.address));

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
    Result.getOrElse(() => [] as ApiTypes.OrderDto[]),
  );

  if (orders.length === 0) {
    return (
      <Card>
        <CardSection
          position="only"
          className="flex flex-col items-center py-8"
        >
          <Text as="span" variant="bodySmGray2">
            No open orders for this market
          </Text>
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

export function OrdersTabContent({ market }: { market: ApiTypes.MarketDto }) {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  if (!isWalletConnected(wallet)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Text as="p" variant="headingBase">
          Wallet not connected
        </Text>
        <Text as="p" variant="helperSmGray1" className="text-center">
          Connect your wallet to see your orders
        </Text>
      </div>
    );
  }

  return <OrdersTabContentWithWallet wallet={wallet} market={market} />;
}
