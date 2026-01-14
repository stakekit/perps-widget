import { Result, useAtomValue } from "@effect-atom/atom-react";
import { Link, Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { positionsAtom } from "@/atoms/portfolio-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import {
  getTPOrSLConfigurationFromPosition,
  TPOrSLDialog,
  type TPOrSLOption,
  type TPOrSLSettings,
} from "@/components/molecules/tp-sl-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardSection } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { hasSLUpdatePendingAction } from "@/domain/position";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet";
import { formatAmount, formatPercentage } from "@/lib/utils";
import type {
  MarketDto,
  PositionDto,
} from "@/services/api-client/client-factory";
import { useEditSLTP } from "./state";

function PositionCardContent({
  position,
  market,
  wallet,
}: {
  position: PositionDto;
  market: MarketDto;
  wallet: WalletConnected;
}) {
  const { editSLTPResult, editSLTP } = useEditSLTP();
  const [dialogMode, setDialogMode] = useState<TPOrSLOption | null>(null);

  const isSubmitting = Result.isWaiting(editSLTPResult);

  const initialAutoCloseSettings: TPOrSLSettings = {
    takeProfit: getTPOrSLConfigurationFromPosition({
      amount: position.takeProfit,
      entryPrice: position.entryPrice,
    }),
    stopLoss: getTPOrSLConfigurationFromPosition({
      amount: position.stopLoss,
      entryPrice: position.entryPrice,
    }),
  };

  const handleAutoCloseSubmit = (settings: TPOrSLSettings) => {
    if (!dialogMode) return;
    editSLTP({
      position,
      wallet,
      tpOrSLSettings: settings,
      actionType: dialogMode,
    });
  };

  const symbol = market.baseAsset.symbol;
  const sizeNum = Number.parseFloat(position.size);
  const value = position.markPrice * sizeNum;
  const pnlPercent =
    position.margin > 0 ? (position.unrealizedPnl / position.margin) * 100 : 0;
  const isPnlPositive = position.unrealizedPnl >= 0;

  if (Result.isSuccess(editSLTPResult)) {
    return (
      <Navigate
        to="/position-details/$marketId/edit-sl-tp/sign"
        params={{ marketId: position.marketId }}
      />
    );
  }

  return (
    <Card>
      {/* Header Row - Symbol & PnL */}
      <CardSection position="first" className="flex gap-2 py-5">
        <div className="flex flex-1 flex-col gap-3">
          <span className="text-white text-base font-semibold tracking-tight">
            {symbol} {position.leverage}x
          </span>
          <span className="text-gray-2 text-sm font-semibold tracking-tight">
            {position.size} {symbol}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-3 items-end">
          <span className="text-white text-base font-semibold tracking-tight">
            {formatAmount(value)}
          </span>
          <span
            className={`text-sm font-semibold tracking-tight ${
              isPnlPositive ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {isPnlPositive ? "+" : ""}
            {formatAmount(position.unrealizedPnl)} ({isPnlPositive ? "+" : ""}
            {formatPercentage(pnlPercent)})
          </span>
        </div>
      </CardSection>

      {/* Second Row - Entry, Liq. Price, Margin */}
      <CardSection position="middle" className="flex gap-4 py-5">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Entry
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {formatAmount(position.entryPrice)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Liq. Price
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {formatAmount(position.liquidationPrice)}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Margin
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {formatAmount(position.margin)}
          </span>
        </div>
      </CardSection>

      {/* Third Row - Take profit, Stop loss, Side */}
      <CardSection position="middle" className="flex gap-4 py-5">
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Take profit
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {position.takeProfit
              ? formatAmount(position.takeProfit)
              : "Not set"}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Stop loss
          </span>
          <span className="text-white text-base font-semibold tracking-tight">
            {position.stopLoss ? formatAmount(position.stopLoss) : "Not set"}
          </span>
        </div>
        <div className="flex flex-1 flex-col gap-2.5">
          <span className="text-gray-2 text-xs font-semibold tracking-tight">
            Side
          </span>
          <span
            className={`font-semibold text-base tracking-tight ${
              position.side === "long" ? "text-accent-green" : "text-accent-red"
            }`}
          >
            {position.side === "long" ? "Long" : "Short"}
          </span>
        </div>
      </CardSection>

      {/* Bottom Row - Action Buttons */}
      <CardSection position="last" className="flex gap-4 p-4">
        {hasSLUpdatePendingAction(position) && (
          <>
            <Button
              variant="secondary"
              className="flex-1 h-[42px] bg-[#212121] hover:bg-[#2a2a2a] text-white rounded-[10px] text-base font-semibold"
              onClick={() => setDialogMode("takeProfit")}
              disabled={isSubmitting}
            >
              {isSubmitting && dialogMode === "takeProfit" ? (
                <Spinner className="size-5" />
              ) : (
                "Edit TP"
              )}
            </Button>
            <Button
              variant="secondary"
              className="flex-1 h-[42px] bg-[#212121] hover:bg-[#2a2a2a] text-white rounded-[10px] text-base font-semibold"
              onClick={() => setDialogMode("stopLoss")}
              disabled={isSubmitting}
            >
              {isSubmitting && dialogMode === "stopLoss" ? (
                <Spinner className="size-5" />
              ) : (
                "Edit SL"
              )}
            </Button>
          </>
        )}
        <Link
          to="/position-details/$marketId/close"
          params={{ marketId: position.marketId }}
          className="flex-1"
        >
          <Button
            variant="secondary"
            className="w-full h-[42px] bg-[#212121] hover:bg-[#2a2a2a] text-white rounded-[10px] text-base font-semibold"
          >
            Close position
          </Button>
        </Link>
      </CardSection>

      {/* Auto Close Position Dialog */}
      {dialogMode && (
        <TPOrSLDialog
          onOpenChange={(open) => !open && setDialogMode(null)}
          settings={initialAutoCloseSettings}
          onSettingsChange={handleAutoCloseSubmit}
          entryPrice={position.entryPrice}
          currentPrice={position.markPrice}
          liquidationPrice={position.liquidationPrice}
          mode={dialogMode}
        />
      )}
    </Card>
  );
}

function PositionTabContentWithWallet({
  wallet,
  market,
}: {
  wallet: WalletConnected;
  market: MarketDto;
}) {
  const positionsResult = useAtomValue(positionsAtom(wallet));

  if (Result.isWaiting(positionsResult)) {
    return (
      <div className="flex flex-col gap-2">
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
    );
  }

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
          <span className="text-gray-2 text-sm">
            No open position for this market
          </span>
        </CardSection>
      </Card>
    );
  }

  return (
    <PositionCardContent position={position} market={market} wallet={wallet} />
  );
}

export function PositionTabContent({ market }: { market: MarketDto }) {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));

  if (!isWalletConnected(wallet)) {
    return (
      <div className="flex flex-col items-center justify-center py-12 gap-4">
        <p className="text-foreground font-semibold text-base">
          Wallet not connected
        </p>
        <p className="text-gray-1 text-sm text-center">
          Connect your wallet to see your positions
        </p>
      </div>
    );
  }

  return <PositionTabContentWithWallet wallet={wallet} market={market} />;
}
