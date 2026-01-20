import { Result } from "@effect-atom/atom-react";
import { Navigate, useParams } from "@tanstack/react-router";
import {
  SLIDER_STOPS,
  useCloseCalculations,
  useClosePercentage,
  usePosition,
  useSubmitClose,
} from "@/components/modules/PositionDetails/Close/state";
import { BackButton } from "@/components/molecules/navigation/back-button";
import { WalletProtectedRoute } from "@/components/molecules/navigation/wallet-protected-route";
import { PercentageSlider } from "@/components/molecules/percentage-slider";
import { Button } from "@/components/ui/button";
import { Divider } from "@/components/ui/divider";
import { Skeleton } from "@/components/ui/skeleton";
import { getPositionChangePercent } from "@/domain/position";
import type { WalletConnected } from "@/domain/wallet";
import { formatAmount, formatPercentage, formatTokenAmount } from "@/lib/utils";
import type { PositionDto } from "@/services/api-client/api-schemas";

function ClosePositionLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-4">
          <Skeleton className="w-6 h-6" />
          <div className="flex flex-col gap-1 flex-1">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-6">
          {/* Amount Display */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-12 w-40" />
            <Skeleton className="h-4 w-24" />
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-2.5 pt-9">
            <Skeleton className="h-4 w-full" />
            <div className="flex justify-between">
              {SLIDER_STOPS.map((stop) => (
                <Skeleton key={stop} className="h-4 w-8" />
              ))}
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-9">
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
            <Skeleton className="h-14 w-full" />
          </div>
        </div>
      </div>
      <Skeleton className="w-full h-14 rounded-[10px]" />
    </div>
  );
}

function ClosePositionContent({
  wallet,
  position,
}: {
  wallet: WalletConnected;
  position: PositionDto;
}) {
  const { closePercentage, setClosePercentage } = useClosePercentage();
  const calculations = useCloseCalculations(position);
  const { submitClose, submitResult } = useSubmitClose();

  const isPnlPositive = position.unrealizedPnl >= 0;
  const priceChangePercent = getPositionChangePercent(position);
  const isPositive = priceChangePercent >= 0;

  const handleSubmit = () => submitClose({ position, wallet });

  return (
    <div className="flex flex-col gap-8 justify-between">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-4">
          <BackButton />
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="text-white font-semibold text-base tracking-tight">
                Close amount
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-2 font-semibold text-sm tracking-tight">
                {formatAmount(position.markPrice)}
              </span>
              <span
                className={`font-semibold text-xs tracking-tight ${
                  isPositive ? "text-accent-green" : "text-accent-red"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatPercentage(priceChangePercent)}
              </span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-6">
          {/* Amount Display */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <p className="text-gray-2 text-sm font-semibold tracking-tight text-center">
              Select amount to close
            </p>
            <p className="text-white text-[44px] font-semibold tracking-[-1.76px] leading-none text-center">
              {formatAmount(calculations.closeValue)}
            </p>
            <p className="text-gray-2 text-sm font-semibold tracking-tight text-center">
              {formatTokenAmount({
                amount: calculations.closeSize,
                symbol: "Size:",
              })}
            </p>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-2.5 pt-9">
            <PercentageSlider
              percentage={closePercentage}
              onPercentageChange={setClosePercentage}
            />
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-9 gap-3 mt-3">
            {/* Margin Row */}
            <div className="flex items-center justify-between rounded-t-2xl">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                Margin
              </span>
              <div className="flex items-center gap-2.5">
                <span className="text-gray-2 text-sm font-normal tracking-tight">
                  {formatAmount(calculations.marginReturn)}
                </span>
                <span
                  className={`text-sm font-normal tracking-tight ${
                    isPnlPositive ? "text-accent-green" : "text-accent-red"
                  }`}
                >
                  {isPnlPositive ? "+" : ""}
                  {formatAmount(calculations.pnlReturn)}
                </span>
              </div>
            </div>

            <Divider />

            {/* You will receive Row */}
            <div className="flex items-center justify-between">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                You will receive
              </span>
              <span className="text-gray-2 text-sm font-normal tracking-tight">
                {formatAmount(calculations.youWillReceive)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <Button
        onClick={handleSubmit}
        loading={submitResult.waiting}
        disabled={submitResult.waiting || closePercentage === 0}
        className="w-full h-14 bg-white text-black hover:bg-white/90 text-base font-semibold"
      >
        {submitResult.waiting ? "Processing..." : "Close position"}
      </Button>

      {/* Navigate to sign route on successful submit */}
      {Result.isSuccess(submitResult) && (
        <Navigate
          to="/position-details/$marketId/close/sign"
          params={{ marketId: position.marketId }}
        />
      )}
    </div>
  );
}

const ClosePositionRouteWithWallet = ({
  wallet,
}: {
  wallet: WalletConnected;
}) => {
  const { marketId } = useParams({
    from: "/position-details/$marketId/close",
  });
  const position = usePosition(wallet, marketId);

  if (Result.isInitial(position)) {
    return <ClosePositionLoading />;
  }

  if (Result.isSuccess(position)) {
    return <ClosePositionContent wallet={wallet} position={position.value} />;
  }

  return <Navigate to="/" />;
};

export function ClosePositionRoute() {
  return (
    <WalletProtectedRoute>
      {(wallet) => <ClosePositionRouteWithWallet wallet={wallet} />}
    </WalletProtectedRoute>
  );
}
