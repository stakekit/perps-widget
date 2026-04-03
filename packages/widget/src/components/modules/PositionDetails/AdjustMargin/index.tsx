import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Navigate, useParams, useSearch } from "@tanstack/react-router";
import hyperliquidLogo from "@yieldxyz/perps-common/assets/hyperliquid.png";
import { marketAtom } from "@yieldxyz/perps-common/atoms";
import {
  Button,
  Card,
  CardSection,
  Divider,
  PercentageSlider,
  Text,
  TokenIcon,
} from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import {
  formatAmount,
  formatPercentage,
  getTokenLogo,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { Match } from "effect";
import { BackButton } from "../../../molecules/navigation/back-button";
import { WalletProtectedRoute } from "../../../molecules/navigation/wallet-protected-route";
import { AdjustMarginLoading } from "./loading";
import {
  getAdjustMarginCalculations,
  makeAdjustMarginFormKey,
  useAdjustMargin,
  useAdjustMarginPosition,
  useSelectedProviderBalanceResult,
} from "./state";

function AdjustMarginContent({
  wallet,
  marketRef,
  position,
  availableBalance,
  mode,
}: {
  wallet: WalletConnected;
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
  position: ApiTypes.PositionDto;
  availableBalance: number;
  mode: "add" | "remove";
}) {
  const market = useAtomRef(marketRef);
  const title = mode === "add" ? "Add Margin" : "Remove Margin";
  const formKey = makeAdjustMarginFormKey({
    walletAddress: wallet.currentAccount.address,
    marketId: position.marketId,
    mode,
  });
  const {
    AdjustMarginForm,
    submit,
    submitResult,
    percentage,
    handlePercentageChange,
    amount,
    mode: selectedMode,
  } = useAdjustMargin({
    key: formKey,
    position,
    availableBalance,
    mode,
  });

  if (position.marginMode !== "isolated") {
    return (
      <Navigate
        to="/position-details/$marketId"
        params={{ marketId: position.marketId }}
      />
    );
  }

  const calculations = getAdjustMarginCalculations({
    position,
    availableBalance,
    amount,
    mode: selectedMode,
  });

  const symbol = market.baseAsset.symbol;
  const logo = market.baseAsset.logoURI ?? getTokenLogo(symbol);
  const isPositive = market.priceChangePercent24h >= 0;
  const submitDisabled =
    Result.isWaiting(submitResult) ||
    amount <= 0 ||
    calculations.estimatedLiquidationPrice === null;

  const estimateClassName = Match.value({ amount, mode: selectedMode }).pipe(
    Match.when({ amount: 0 }, () => "text-gray-2"),
    Match.when({ mode: "add" }, () => "text-accent-green"),
    Match.orElse(() => "text-accent-red"),
  );

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-2 pb-4">
          <BackButton />
          <div className="relative shrink-0 size-9">
            <TokenIcon logoURI={logo} name={symbol} />
            <div className="absolute -bottom-0.5 -right-0.5 size-4 rounded-full border-2 border-background overflow-hidden">
              <img
                src={hyperliquidLogo}
                alt="Hyperliquid"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2.5">
              <Text as="span" variant="labelBaseWhite">
                {title}
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Text as="span" variant="labelSmGray2Tight">
                {symbol} {formatAmount(market.markPrice)}
              </Text>
              <Text
                as="span"
                variant="labelXs"
                className={isPositive ? "text-accent-green" : "text-accent-red"}
              >
                {isPositive ? "+" : ""}
                {formatPercentage(market.priceChangePercent24h)}
              </Text>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-6 pt-6">
          <AdjustMarginForm.Initialize
            defaultValues={{ Amount: "0", Mode: mode }}
          >
            <div className="flex flex-col items-center gap-0 pt-2">
              <AdjustMarginForm.Amount />
              <Text
                as="p"
                variant="labelSmGray2Tight"
                className="text-center mt-4"
              >
                {selectedMode === "add"
                  ? "Available balance"
                  : "Removable margin"}
                : {formatAmount(calculations.maxAmount)}
              </Text>
            </div>
          </AdjustMarginForm.Initialize>

          <div className="w-full">
            <Text as="p" variant="labelSmGray2Tight">
              {selectedMode === "add" ? "Add" : "Remove"}: {percentage}%
            </Text>
            <PercentageSlider
              percentage={percentage}
              onPercentageChange={handlePercentageChange}
            />
          </div>

          <Card>
            <CardSection
              position="first"
              className="flex items-center justify-between"
            >
              <Text as="span" variant="labelSmGray2Tight">
                Current margin
              </Text>
              <Text as="span" variant="bodySmGray2Tight">
                {formatAmount(calculations.currentMargin)}
              </Text>
            </CardSection>

            <Divider />

            <CardSection
              position="middle"
              className="flex items-center justify-between"
            >
              <Text as="span" variant="labelSmGray2Tight">
                Available balance
              </Text>
              <Text as="span" variant="bodySmGray2Tight">
                {formatAmount(availableBalance)}
              </Text>
            </CardSection>

            <Divider />

            <CardSection
              position="middle"
              className="flex items-center justify-between"
            >
              <Text as="span" variant="labelSmGray2Tight">
                Current liq. price
              </Text>
              <Text as="span" variant="bodySmGray2Tight">
                {formatAmount(calculations.currentLiquidationPrice)}
              </Text>
            </CardSection>

            <Divider />

            <CardSection
              position="last"
              className="flex items-center justify-between"
            >
              <Text as="span" variant="labelSmGray2Tight">
                Est. liq. price
              </Text>
              <Text
                as="span"
                variant="bodySmTight"
                className={estimateClassName}
              >
                {calculations.estimatedLiquidationPrice === null
                  ? "--"
                  : formatAmount(calculations.estimatedLiquidationPrice)}
              </Text>
            </CardSection>
          </Card>
        </div>
      </div>

      <Button
        onClick={() => submit()}
        loading={Result.isWaiting(submitResult)}
        disabled={submitDisabled}
        size="lg"
        className="w-full text-base font-semibold bg-white text-black hover:bg-white/90"
      >
        {selectedMode === "add" ? "Add margin" : "Remove margin"}
      </Button>

      {Result.isSuccess(submitResult) && (
        <Navigate
          to="/position-details/$marketId/adjust-margin/sign"
          params={{ marketId: position.marketId }}
        />
      )}
    </div>
  );
}

function AdjustMarginRouteWithWallet({ wallet }: { wallet: WalletConnected }) {
  const { marketId } = useParams({
    from: "/position-details/$marketId/adjust-margin",
  });
  const { mode } = useSearch({
    from: "/position-details/$marketId/adjust-margin",
  });
  const selectedMode = mode ?? "add";
  const formKey = makeAdjustMarginFormKey({
    walletAddress: wallet.currentAccount.address,
    marketId,
    mode: selectedMode,
  });
  const market = useAtomValue(marketAtom(marketId));
  const position = useAdjustMarginPosition(formKey);
  const providerBalance = useSelectedProviderBalanceResult(
    wallet.currentAccount.address,
  );

  if (
    Result.isInitial(market) ||
    Result.isInitial(position) ||
    Result.isInitial(providerBalance)
  ) {
    return <AdjustMarginLoading />;
  }

  if (
    !Result.isSuccess(market) ||
    !Result.isSuccess(position) ||
    !Result.isSuccess(providerBalance)
  ) {
    return <Navigate to="/position-details/$marketId" params={{ marketId }} />;
  }

  return (
    <AdjustMarginContent
      wallet={wallet}
      marketRef={market.value}
      position={position.value}
      availableBalance={providerBalance.value.availableBalance}
      mode={selectedMode}
    />
  );
}

export function AdjustMarginRoute() {
  return (
    <WalletProtectedRoute>
      {(wallet) => <AdjustMarginRouteWithWallet wallet={wallet} />}
    </WalletProtectedRoute>
  );
}
