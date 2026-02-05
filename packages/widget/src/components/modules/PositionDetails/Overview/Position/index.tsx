import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link, Navigate } from "@tanstack/react-router";
import {
  ordersAtom,
  positionsAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  Button,
  Card,
  CardSection,
  LeverageDialog,
  Skeleton,
  Text,
  TPOrSLDialog,
  type TPOrSLOption,
  type TPOrSLSettings,
} from "@yieldxyz/perps-common/components";
import {
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import {
  usePositionActions,
  useTpSlOrders,
} from "@yieldxyz/perps-common/hooks";
import {
  calcNotionalUsd,
  calcPnlPercent,
  formatAmount,
  formatPercentage,
  getMaxLeverage,
  getTPOrSLConfigurationFromPosition,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { useEditSLTP, useUpdateLeverage } from "./state";

function PositionCardContent({
  position,
  market,
  wallet,
  orders,
}: {
  orders: ApiTypes.OrderDto[];
  position: ApiTypes.PositionDto;
  market: ApiTypes.MarketDto;
  wallet: WalletConnected;
}) {
  const { editTPResult, editTP, editSLResult, editSL } = useEditSLTP();
  const { updateLeverageResult, updateLeverage } = useUpdateLeverage();

  const positionActions = usePositionActions(position);
  const tpSlOrders = useTpSlOrders(orders);

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

  if (Result.isSuccess(editTPResult) || Result.isSuccess(editSLResult)) {
    return (
      <Navigate
        to="/position-details/$marketId/edit-sl-tp/sign"
        params={{ marketId: position.marketId }}
      />
    );
  }

  if (Result.isSuccess(updateLeverageResult)) {
    return (
      <Navigate
        to="/position-details/$marketId/edit-leverage"
        params={{ marketId: position.marketId }}
      />
    );
  }

  return (
    <Card>
      {/* Header Row - Symbol & PnL */}
      <CardSection position="first" className="flex gap-2 py-5">
        <div className="flex flex-1 flex-col gap-3">
          <Text as="span" variant="labelBaseWhite">
            {symbol} {position.leverage}x
          </Text>
          <Text as="span" variant="labelSmGray2Tight">
            {position.size} {symbol}
          </Text>
        </div>
        <div className="flex flex-1 flex-col gap-3 items-end">
          <Text as="span" variant="labelBaseWhite">
            {formatAmount(value)}
          </Text>
          <Text
            as="span"
            variant="labelSm"
            className={isPnlPositive ? "text-accent-green" : "text-accent-red"}
          >
            {isPnlPositive ? "+" : ""}
            {formatAmount(position.unrealizedPnl)} ({isPnlPositive ? "+" : ""}
            {formatPercentage(pnlPercent)})
          </Text>
        </div>
      </CardSection>

      {/* Second Row - Entry, Liq. Price, Margin */}
      <CardSection position="middle" className="flex gap-4 py-5">
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Entry
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {formatAmount(position.entryPrice)}
          </Text>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Liq. Price
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {formatAmount(position.liquidationPrice)}
          </Text>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Margin
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {formatAmount(position.margin)}
          </Text>
        </div>
      </CardSection>

      {/* Third Row - Take profit, Stop loss, Side */}
      <CardSection position="middle" className="flex gap-4 py-5">
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Take profit
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {tpSlOrders.takeProfit?.triggerPrice
              ? formatAmount(tpSlOrders.takeProfit.triggerPrice)
              : "Not set"}
          </Text>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Stop loss
          </Text>
          <Text as="span" variant="labelBaseWhite">
            {tpSlOrders.stopLoss?.triggerPrice
              ? formatAmount(tpSlOrders.stopLoss.triggerPrice)
              : "Not set"}
          </Text>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <Text as="span" variant="labelXsGray2">
            Side
          </Text>
          <Text
            as="span"
            variant="labelBase"
            className={
              position.side === "long" ? "text-accent-green" : "text-accent-red"
            }
          >
            {position.side === "long" ? "Long" : "Short"}
          </Text>
        </div>
      </CardSection>

      {/* Bottom Row - Action Buttons */}
      <CardSection
        position="last"
        className="flex flex-col gap-2 p-4 flex-wrap"
      >
        <div className="flex gap-4 justify-between">
          {positionActions.takeProfit && (
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
              <Button
                variant="secondary"
                className="flex-1"
                disabled={Result.isWaiting(editTPResult)}
                loading={Result.isWaiting(editTPResult)}
              >
                {tpSlOrders.takeProfit ? "Edit TP" : "Set TP"}
              </Button>
            </TPOrSLDialog>
          )}
          {positionActions.stopLoss && (
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
              <Button
                variant="secondary"
                className="flex-1"
                disabled={Result.isWaiting(editSLResult)}
                loading={Result.isWaiting(editSLResult)}
              >
                {tpSlOrders.stopLoss ? "Edit SL" : "Set SL"}
              </Button>
            </TPOrSLDialog>
          )}
          {positionActions.updateLeverage && (
            <LeverageDialog
              leverage={position.leverage}
              onLeverageChange={handleLeverageChange}
              currentPrice={position.markPrice}
              maxLeverage={getMaxLeverage(market.leverageRange)}
              side={position.side}
            >
              <Button
                variant="secondary"
                className="flex-1"
                disabled={Result.isWaiting(updateLeverageResult)}
                loading={Result.isWaiting(updateLeverageResult)}
              >
                {position.leverage ? "Edit leverage" : "Set leverage"}
              </Button>
            </LeverageDialog>
          )}
        </div>

        <Link
          to="/position-details/$marketId/close"
          params={{ marketId: position.marketId }}
          className="flex-1 rounded-lg"
        >
          <Button variant="destructive" size="default" className="w-full">
            Close position
          </Button>
        </Link>
      </CardSection>
    </Card>
  );
}

function PositionTabContentWithWallet({
  wallet,
  market,
}: {
  wallet: WalletConnected;
  market: ApiTypes.MarketDto;
}) {
  const positionsResult = useAtomValue(
    positionsAtom(wallet.currentAccount.address),
  );
  const ordersResult = useAtomValue(ordersAtom(wallet.currentAccount.address));

  if (Result.isInitial(positionsResult) || Result.isInitial(ordersResult)) {
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

  const position = positionsResult.pipe(
    Result.map((positions) => positions.find((p) => p.marketId === market.id)),
    Result.getOrElse(() => undefined),
  );

  if (!position) {
    return (
      <Card>
        <CardSection
          position="only"
          className="flex flex-col items-center py-8"
        >
          <Text as="span" variant="bodySmGray2">
            No open position for this market
          </Text>
        </CardSection>
      </Card>
    );
  }

  return (
    <PositionCardContent
      position={position}
      market={market}
      wallet={wallet}
      orders={orders}
    />
  );
}

export function PositionTabContent({ market }: { market: ApiTypes.MarketDto }) {
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

  return <PositionTabContentWithWallet wallet={wallet} market={market} />;
}
