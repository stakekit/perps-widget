import { Result, useAtomValue } from "@effect-atom/atom-react";
import {
  marketsAtom,
  ordersAtom,
  positionsAtom,
  selectedProviderBalancesAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import { Skeleton, Text } from "@yieldxyz/perps-common/components";
import {
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import { formatAmount, formatPercentage } from "@yieldxyz/perps-common/lib";
import type { ApiSchemas } from "@yieldxyz/perps-common/services";
import { Array as _Array, Match, Option, Record } from "effect";
import { useState } from "react";
import { OrderCard } from "./order-card";
import { PositionCard } from "./position-card";

function PositionsWithWallet({ wallet }: { wallet: WalletConnected }) {
  const [activeTab, setActiveTab] = useState<"positions" | "orders">(
    "positions",
  );

  const positionsResult = useAtomValue(
    positionsAtom(wallet.currentAccount.address),
  );
  const ordersResult = useAtomValue(ordersAtom(wallet.currentAccount.address));
  const marketsMapResult = useAtomValue(marketsAtom);
  const balancesResult = useAtomValue(
    selectedProviderBalancesAtom(wallet.currentAccount.address),
  );

  const marketsMap = marketsMapResult.pipe(Result.getOrElse(Record.empty));

  const totals = Result.all({
    positions: positionsResult,
    balances: balancesResult,
  }).pipe(
    Result.map(({ positions, balances }) => {
      const positionRefs = Record.values(positions);
      const totalUnrealizedPnl = positionRefs.reduce(
        (acc, ref) => acc + ref.value.unrealizedPnl,
        0,
      );
      const totalMargin = positionRefs.reduce(
        (acc, ref) => acc + ref.value.margin,
        0,
      );
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
    Result.isInitial(positionsResult) ||
    Result.isInitial(ordersResult) ||
    Result.isInitial(marketsMapResult);

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

  const ordersMap = ordersResult.pipe(
    Result.map((orders) => _Array.groupBy(orders, (o) => o.marketId)),
    Result.getOrElse(Record.empty),
  );

  const positionsWithMarketAndOrders = positionsResult.pipe(
    Result.map((positions) =>
      _Array.filterMap(Record.values(positions), (positionRef) =>
        Record.get(marketsMap, positionRef.value.marketId).pipe(
          Option.map((m) => ({
            marketRef: m,
            positionRef,
            orders: Record.get(ordersMap, positionRef.value.marketId).pipe(
              Option.getOrElse(() => [] as ApiSchemas.OrderDto[]),
            ),
          })),
        ),
      ),
    ),
    Result.getOrElse(() => []),
  );

  const ordersWithMarket = ordersResult.pipe(
    Result.map((orders) =>
      _Array.filterMap(orders, (o) =>
        Record.get(marketsMap, o.marketId).pipe(
          Option.map((m) => ({ marketRef: m, order: o })),
        ),
      ),
    ),
    Result.getOrElse(() => []),
  );

  const totalsData = totals.pipe(Result.getOrElse(() => null));

  if (!totalsData) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Text as="p" variant="headingBase">
          Unable to load data
        </Text>
        <Text as="p" variant="helperSmGray1" className="text-center">
          Please try again later
        </Text>
      </div>
    );
  }

  const isPnlPositive = totalsData.pnlPercent >= 0;

  return (
    <div className="flex flex-col gap-2 w-full">
      {/* Total value section */}
      <div className="flex items-center justify-between pb-5">
        <Text as="span" variant="amountDisplay30">
          {formatAmount(totalsData.accountValue)}
        </Text>
        <div className="flex flex-col items-end justify-center gap-2.5">
          <Text
            as="span"
            variant="labelSm"
            className={isPnlPositive ? "text-accent-green" : "text-accent-red"}
          >
            {isPnlPositive ? "+" : ""}
            {formatAmount(totalsData.unrealizedPnl)}
          </Text>
          <Text
            as="span"
            variant="labelSm"
            className={isPnlPositive ? "text-accent-green" : "text-accent-red"}
          >
            {isPnlPositive ? "+" : ""}
            {formatPercentage(totalsData.pnlPercent)}
          </Text>
        </div>
      </div>

      {/* Positions/Orders tabs */}
      <div className="bg-surface-2 h-12 p-[5px] rounded-xl flex gap-[5px]">
        <button
          type="button"
          onClick={() => setActiveTab("positions")}
          className={`flex-1 h-[36px] rounded-xl flex items-center justify-center font-semibold text-sm tracking-tight transition-colors ${
            activeTab === "positions"
              ? "bg-white text-black border border-white"
              : "bg-transparent text-gray-2 hover:text-white"
          }`}
        >
          Positions ({positionsWithMarketAndOrders.length})
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
        {Match.value(activeTab).pipe(
          Match.when("positions", () =>
            positionsWithMarketAndOrders.length > 0 ? (
              positionsWithMarketAndOrders.map(
                ({ marketRef, positionRef, orders }) => (
                  <PositionCard
                    key={positionRef.value.marketId}
                    positionRef={positionRef}
                    marketRef={marketRef}
                    orders={orders}
                  />
                ),
              )
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Text as="p" variant="headingBase">
                  No open positions
                </Text>
                <Text as="p" variant="helperSmGray1" className="text-center">
                  Start trading to see your positions here
                </Text>
              </div>
            ),
          ),
          Match.orElse(() =>
            ordersWithMarket.length > 0 ? (
              ordersWithMarket.map(({ marketRef, order }, idx) => (
                <OrderCard
                  key={`${order.marketId}-${order.createdAt}-${idx}`}
                  order={order}
                  marketRef={marketRef}
                />
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 gap-4">
                <Text as="p" variant="headingBase">
                  No open orders
                </Text>
                <Text as="p" variant="helperSmGray1" className="text-center">
                  Your pending orders will appear here
                </Text>
              </div>
            ),
          ),
        )}
      </div>
    </div>
  );
}

export function Positions() {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  if (!isWalletConnected(wallet)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <Text as="p" variant="headingBase">
          Wallet not connected
        </Text>
        <Text as="p" variant="helperSmGray1" className="text-center">
          Connect your wallet to see your positions
        </Text>
      </div>
    );
  }

  return <PositionsWithWallet wallet={wallet} />;
}
