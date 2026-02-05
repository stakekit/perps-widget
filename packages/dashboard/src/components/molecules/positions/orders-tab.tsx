import { Result, useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import {
  cancelOrderAtom,
  marketsAtom,
  ordersAtom,
} from "@yieldxyz/perps-common/atoms";
import { Text } from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import { useOrderActions } from "@yieldxyz/perps-common/hooks";
import {
  calcNotionalUsd,
  cn,
  formatAmount,
  formatDate,
  formatSnakeCase,
} from "@yieldxyz/perps-common/lib";
import type { ApiSchemas } from "@yieldxyz/perps-common/services";
import { Array as _Array, Option, Record } from "effect";
import {
  OrdersTableSkeleton,
  tableCellClass,
  tableHeaderClass,
} from "./shared";

interface OrderWithMarket {
  order: ApiSchemas.OrderDto;
  market: ApiSchemas.MarketDto;
  wallet: WalletConnected;
}

interface OrdersTableContentProps {
  orders: OrderWithMarket[];
  isLoading: boolean;
  wallet: WalletConnected;
}

export function OrdersTabWithWallet({ wallet }: { wallet: WalletConnected }) {
  const ordersResult = useAtomValue(ordersAtom(wallet.currentAccount.address));
  const marketsMapResult = useAtomValue(marketsAtom);

  const isLoading =
    Result.isInitial(ordersResult) || Result.isInitial(marketsMapResult);

  const marketsMap = marketsMapResult.pipe(Result.getOrElse(Record.empty));

  const ordersWithMarket = ordersResult.pipe(
    Result.map((orders) =>
      _Array.filterMap(orders, (o) =>
        Record.get(marketsMap, o.marketId).pipe(
          Option.map((marketRef) => ({
            order: o,
            market: marketRef.value,
            wallet,
          })),
        ),
      ),
    ),
    Result.getOrElse(() => []),
  );

  return (
    <OrdersTableContent
      orders={ordersWithMarket}
      isLoading={isLoading}
      wallet={wallet}
    />
  );
}

function OrderRow({ order, market, wallet }: OrderWithMarket) {
  const { cancelOrderAction } = useOrderActions(order);
  const price = order.limitPrice ?? order.triggerPrice ?? 0;
  const value = calcNotionalUsd({ priceUsd: price, sizeBase: order.size });
  const symbol = market.baseAsset.symbol;
  const isLong = order.side === "long";

  return (
    <tr className="border-b border-background last:border-b-0 hover:bg-white/2 transition-colors">
      <td className={cn(tableCellClass, "py-3 pl-4 pr-2")}>
        {formatSnakeCase(order.type)}
      </td>
      <td className={cn(tableCellClass, "py-3 px-2")}>
        {formatDate(order.createdAt)}
      </td>
      <td className="py-3 px-2">
        <Text
          className={cn(
            "text-xs font-normal",
            isLong ? "text-[#71e96d]" : "text-[#ff4141]",
          )}
        >
          {isLong ? "Long" : "Short"}
        </Text>
      </td>
      <td className={cn(tableCellClass, "py-3 px-2")}>
        {order.size} {symbol}
      </td>
      <td className={cn(tableCellClass, "py-3 px-2")}>{formatAmount(price)}</td>
      <td className={cn(tableCellClass, "py-3 px-2")}>
        {formatAmount(market.markPrice)}
      </td>
      <td className={cn(tableCellClass, "py-3 px-2")}>{formatAmount(value)}</td>
      <td className="py-3 pl-2 pr-4">
        {cancelOrderAction && (
          <CancelOrderButton
            wallet={wallet}
            marketId={cancelOrderAction.args.marketId}
            orderId={cancelOrderAction.args.orderId}
          />
        )}
      </td>
    </tr>
  );
}

function CancelOrderButton({
  wallet,
  marketId,
  orderId,
}: {
  wallet: WalletConnected;
  marketId: string;
  orderId: string;
}) {
  const cancelOrderResult = useAtomValue(cancelOrderAtom(orderId));
  const submitCancelOrder = useAtomSet(cancelOrderAtom(orderId));

  const handleCancelOrder = () =>
    submitCancelOrder({
      marketId,
      walletAddress: wallet.currentAccount.address,
    });

  const isLoading = Result.isWaiting(cancelOrderResult);

  return (
    <button
      type="button"
      onClick={handleCancelOrder}
      disabled={isLoading}
      className="min-w-[70px] text-left text-xs text-[#ff4141] hover:text-[#ff4141]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? "Cancelling..." : "Cancel"}
    </button>
  );
}

function OrdersTableContent({
  orders,
  isLoading,
  wallet,
}: OrdersTableContentProps) {
  if (isLoading) {
    return <OrdersTableSkeleton />;
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Text className="text-sm text-white">No open orders</Text>
        <Text className="text-xs text-[#707070]">
          Place an order to see it here
        </Text>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-background">
            <th className={cn(tableHeaderClass, "py-3 pl-4 pr-2")}>Type</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Created</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Side</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Size</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Price</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Market</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Value</th>
            <th className={cn(tableHeaderClass, "py-3 pl-2 pr-4")}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {orders.map(({ order, market }, idx) => (
            <OrderRow
              key={`${order.marketId}-${order.createdAt}-${idx}`}
              order={order}
              market={market}
              wallet={wallet}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
