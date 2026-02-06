import {
  type AtomRef,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import {
  marketsAtom,
  ordersAtom,
  positionsAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  LeverageDialog,
  Text,
  TPOrSLDialog,
  type TPOrSLOption,
  type TPOrSLSettings,
} from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import {
  useEditSLTP,
  usePositionActions,
  useTpSlOrders,
  useUpdateLeverage,
} from "@yieldxyz/perps-common/hooks";
import {
  calcNotionalUsd,
  calcPnlPercent,
  cn,
  formatAmount,
  formatPercentage,
  getMaxLeverage,
  getTPOrSLConfigurationFromPosition,
} from "@yieldxyz/perps-common/lib";
import type { ApiSchemas, ApiTypes } from "@yieldxyz/perps-common/services";
import { Array as _Array, Option, Record } from "effect";
import { Pencil } from "lucide-react";
import { selectedMarketAtom } from "../../../atoms/selected-market-atom";
import { ClosePositionDialog } from "./close-position-dialog";
import {
  PositionsTableSkeleton,
  tableCellClass,
  tableHeaderClass,
} from "./shared";

interface PositionWithMarket {
  position: ApiSchemas.PositionDto;
  market: ApiSchemas.MarketDto;
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
}

interface PositionsTableContentProps {
  positions: PositionWithMarket[];
  orders: ApiTypes.OrderDto[];
  wallet: WalletConnected;
  isLoading: boolean;
}

export function PositionsTabWithWallet({
  wallet,
}: {
  wallet: WalletConnected;
}) {
  const positionsResult = useAtomValue(
    positionsAtom(wallet.currentAccount.address),
  );
  const marketsMapResult = useAtomValue(marketsAtom);

  const ordersResult = useAtomValue(ordersAtom(wallet.currentAccount.address));

  const isLoading =
    Result.isInitial(positionsResult) ||
    Result.isInitial(marketsMapResult) ||
    Result.isInitial(ordersResult);

  const marketsMap = marketsMapResult.pipe(Result.getOrElse(Record.empty));

  const positionsWithMarket = positionsResult.pipe(
    Result.map((positions) =>
      _Array.filterMap(positions, (p) =>
        Record.get(marketsMap, p.marketId).pipe(
          Option.map((marketRef) => ({
            position: p,
            market: marketRef.value,
            marketRef,
          })),
        ),
      ),
    ),
    Result.getOrElse(() => []),
  );

  const orders = ordersResult.pipe(
    Result.map((o) => [...o]),
    Result.getOrElse(() => [] as ApiTypes.OrderDto[]),
  );

  return (
    <PositionsTableContent
      positions={positionsWithMarket}
      orders={orders}
      wallet={wallet}
      isLoading={isLoading}
    />
  );
}

function PositionsTableContent({
  positions,
  orders,
  wallet,
  isLoading,
}: PositionsTableContentProps) {
  if (isLoading) {
    return <PositionsTableSkeleton />;
  }

  if (positions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-2">
        <Text className="text-sm text-white">No open positions</Text>
        <Text className="text-xs text-[#707070]">
          Start trading to see your positions here
        </Text>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-background">
            <th className={cn(tableHeaderClass, "py-3 pl-4 pr-2")}>Coin</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Size</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>
              Position value
            </th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Entry Price</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Mark Price</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>PNL (ROE %)</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Liq. Price</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Margin</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Close</th>
            <th className={cn(tableHeaderClass, "py-3 px-2")}>Take Profit</th>
            <th className={cn(tableHeaderClass, "py-3 pl-2 pr-4")}>
              Stop Loss
            </th>
          </tr>
        </thead>
        <tbody>
          {positions.map(({ position, market, marketRef }) => {
            const marketOrders = orders.filter(
              (o) => o.marketId === position.marketId,
            );

            return (
              <PositionRow
                key={position.marketId}
                position={position}
                market={market}
                marketRef={marketRef}
                orders={marketOrders}
                wallet={wallet}
              />
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface PositionRowProps {
  position: ApiSchemas.PositionDto;
  market: ApiSchemas.MarketDto;
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
  orders: ApiTypes.OrderDto[];
  wallet: WalletConnected;
}

function PositionRow({
  position,
  market,
  marketRef,
  orders,
  wallet,
}: PositionRowProps) {
  const { updateLeverage } = useUpdateLeverage();
  const { editTP, editSL } = useEditSLTP();
  const setSelectedMarket = useAtomSet(selectedMarketAtom);

  const positionActions = usePositionActions(position);
  const tpSlOrders = useTpSlOrders(orders);

  const symbol = market.baseAsset.symbol;
  const value = calcNotionalUsd({
    priceUsd: position.markPrice,
    sizeBase: position.size,
  });
  const pnlPercent = calcPnlPercent({
    pnlUsd: position.unrealizedPnl,
    marginUsd: position.margin,
  });
  const isPnlPositive = position.unrealizedPnl >= 0;
  const isLong = position.side === "long";

  const initialAutoCloseSettings: TPOrSLSettings = {
    takeProfit: getTPOrSLConfigurationFromPosition({
      amount: tpSlOrders.takeProfit?.triggerPrice ?? undefined,
      entryPrice: position.entryPrice,
      tpOrSl: "takeProfit",
      side: position.side,
    }),
    stopLoss: getTPOrSLConfigurationFromPosition({
      amount: tpSlOrders.stopLoss?.triggerPrice ?? undefined,
      entryPrice: position.entryPrice,
      tpOrSl: "stopLoss",
      side: position.side,
    }),
  };

  const handleAutoCloseSubmit = (
    settings: TPOrSLSettings,
    actionType: TPOrSLOption,
  ) => {
    if (actionType === "takeProfit") {
      editTP({ position, wallet, tpOrSLSettings: settings });
    } else {
      editSL({ position, wallet, tpOrSLSettings: settings });
    }
  };

  const handleLeverageChange = (newLeverage: number) => {
    updateLeverage({
      position,
      wallet,
      newLeverage,
    });
  };

  const tpValue = tpSlOrders.takeProfit?.triggerPrice;
  const slValue = tpSlOrders.stopLoss?.triggerPrice;
  const handleMarketSelect = () => {
    setSelectedMarket(marketRef);
  };

  return (
    <tr className="border-b border-background last:border-b-0 hover:bg-white/2 transition-colors">
      {/* Coin column with clickable leverage */}
      <td className="py-3 pl-4 pr-2">
        <Text
          className={cn(
            "text-xs font-normal",
            isLong ? "text-[#71e96d]" : "text-[#ff4141]",
          )}
        >
          <button
            type="button"
            onClick={handleMarketSelect}
            className="cursor-pointer hover:opacity-80 transition-opacity"
          >
            {symbol}
          </button>{" "}
          {positionActions.updateLeverage ? (
            <LeverageDialog
              leverage={position.leverage}
              onLeverageChange={handleLeverageChange}
              currentPrice={position.markPrice}
              maxLeverage={getMaxLeverage(market.leverageRange)}
              side={position.side}
            >
              <button
                type="button"
                className="underline cursor-pointer hover:opacity-80 transition-opacity"
              >
                {position.leverage}x
              </button>
            </LeverageDialog>
          ) : (
            <span>{position.leverage}x</span>
          )}
        </Text>
      </td>

      {/* Size */}
      <td className="py-3 px-2">
        <Text
          className={cn(
            "text-xs font-normal",
            isLong ? "text-[#71e96d]" : "text-[#ff4141]",
          )}
        >
          {position.size} {symbol}
        </Text>
      </td>

      {/* Position value */}
      <td className={cn(tableCellClass, "py-3 px-2")}>{formatAmount(value)}</td>

      {/* Entry Price */}
      <td className={cn(tableCellClass, "py-3 px-2")}>
        {formatAmount(position.entryPrice)}
      </td>

      {/* Mark Price */}
      <td className={cn(tableCellClass, "py-3 px-2")}>
        {formatAmount(position.markPrice)}
      </td>

      {/* PNL */}
      <td className="py-3 px-2">
        <Text
          className={cn(
            "text-xs font-normal",
            isPnlPositive ? "text-[#71e96d]" : "text-[#ff4141]",
          )}
        >
          {isPnlPositive ? "+" : ""}
          {formatAmount(position.unrealizedPnl)} ({formatPercentage(pnlPercent)}
          )
        </Text>
      </td>

      {/* Liq. Price */}
      <td className={cn(tableCellClass, "py-3 px-2")}>
        {formatAmount(position.liquidationPrice)}
      </td>

      {/* Margin */}
      <td className="py-3 px-2">
        <Text className="text-xs text-white font-normal">
          {formatAmount(position.margin)} (
          {position.marginMode === "isolated" ? "Isolated" : "Cross"})
        </Text>
      </td>

      {/* Close column */}
      <td className="py-3 px-2">
        <ClosePositionDialog position={position} wallet={wallet}>
          <button
            type="button"
            className="text-xs text-white/60 hover:text-white transition-colors underline"
          >
            Close position
          </button>
        </ClosePositionDialog>
      </td>

      {/* TP column */}
      <td className="py-3 px-2">
        {positionActions.takeProfit ? (
          <TPOrSLDialog
            settings={initialAutoCloseSettings}
            onSettingsChange={(settings) =>
              handleAutoCloseSubmit(settings, "takeProfit")
            }
            entryPrice={position.entryPrice}
            currentPrice={position.markPrice}
            liquidationPrice={position.liquidationPrice}
            side={position.side}
            mode="takeProfit"
          >
            <button
              type="button"
              className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Text className="text-xs text-white font-normal">
                {tpValue ? formatAmount(tpValue) : "--"}
              </Text>
              <Pencil className="size-2.5 text-white/40" />
            </button>
          </TPOrSLDialog>
        ) : (
          <Text className="text-xs text-white font-normal">
            {tpValue ? formatAmount(tpValue) : "--"}
          </Text>
        )}
      </td>

      {/* SL column */}
      <td className="py-3 pl-2 pr-4">
        {positionActions.stopLoss ? (
          <TPOrSLDialog
            settings={initialAutoCloseSettings}
            onSettingsChange={(settings) =>
              handleAutoCloseSubmit(settings, "stopLoss")
            }
            entryPrice={position.entryPrice}
            currentPrice={position.markPrice}
            liquidationPrice={position.liquidationPrice}
            side={position.side}
            mode="stopLoss"
          >
            <button
              type="button"
              className="flex items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
            >
              <Text className="text-xs text-white font-normal">
                {slValue ? formatAmount(slValue) : "--"}
              </Text>
              <Pencil className="size-2.5 text-white/40" />
            </button>
          </TPOrSLDialog>
        ) : (
          <Text className="text-xs text-white font-normal">
            {slValue ? formatAmount(slValue) : "--"}
          </Text>
        )}
      </td>
    </tr>
  );
}
