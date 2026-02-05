import { Result } from "@effect-atom/atom-react";
import { Navigate, useParams } from "@tanstack/react-router";
import { SLIDER_STOPS } from "@yieldxyz/perps-common/atoms";
import {
  Button,
  Divider,
  PercentageSlider,
  Skeleton,
  Text,
} from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import {
  useCloseCalculations,
  useClosePercentage,
  useSubmitClose,
} from "@yieldxyz/perps-common/hooks";
import {
  formatAmount,
  formatPercentage,
  formatTokenAmount,
  getPositionChangePercent,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { BackButton } from "../../../molecules/navigation/back-button";
import { WalletProtectedRoute } from "../../../molecules/navigation/wallet-protected-route";
import { usePosition } from "./state";

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
  position: ApiTypes.PositionDto;
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
              <Text as="span" variant="labelBaseWhite">
                Close amount
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Text as="span" variant="labelSmGray2Tight">
                {formatAmount(position.markPrice)}
              </Text>
              <Text
                as="span"
                variant="labelXs"
                className={isPositive ? "text-accent-green" : "text-accent-red"}
              >
                {isPositive ? "+" : ""}
                {formatPercentage(priceChangePercent)}
              </Text>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-6">
          {/* Amount Display */}
          <div className="flex flex-col items-center gap-4 pt-6">
            <Text as="p" variant="labelSmGray2Tight" className="text-center">
              Select amount to close
            </Text>
            <Text as="p" variant="amountDisplay44" className="text-center">
              {formatAmount(calculations.closeValue)}
            </Text>
            <Text as="p" variant="labelSmGray2Tight" className="text-center">
              {formatTokenAmount({
                amount: calculations.closeSize,
                symbol: "Size:",
              })}
            </Text>
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
              <Text as="span" variant="labelSmGray2Tight">
                Margin
              </Text>
              <div className="flex items-center gap-2.5">
                <Text as="span" variant="bodySmGray2Tight">
                  {formatAmount(calculations.marginReturn)}
                </Text>
                <Text
                  as="span"
                  variant="bodySmTight"
                  className={
                    isPnlPositive ? "text-accent-green" : "text-accent-red"
                  }
                >
                  {isPnlPositive ? "+" : ""}
                  {formatAmount(calculations.pnlReturn)}
                </Text>
              </div>
            </div>

            <Divider />

            {/* You will receive Row */}
            <div className="flex items-center justify-between">
              <Text as="span" variant="labelSmGray2Tight">
                You will receive
              </Text>
              <Text as="span" variant="bodySmGray2Tight">
                {formatAmount(calculations.youWillReceive)}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <Button
        onClick={handleSubmit}
        loading={submitResult.waiting}
        disabled={submitResult.waiting || closePercentage === 0}
        size="lg"
        className="w-full text-base font-semibold bg-white text-black hover:bg-white/90"
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
  const position = usePosition(wallet.currentAccount.address, marketId);

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
