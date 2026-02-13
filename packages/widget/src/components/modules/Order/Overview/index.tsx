import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Navigate, useParams } from "@tanstack/react-router";
import hyperliquidLogo from "@yieldxyz/perps-common/assets/hyperliquid.png";
import {
  LeverageRangesSchema,
  marketAtom,
  orderFormAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  Button,
  Card,
  CardSection,
  Divider,
  LeverageDialog,
  LimitPriceDialog,
  OrderTypeDialog,
  PercentageSlider,
  Text,
  TokenIcon,
  TPOrSLDialog,
} from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import {
  useHandlePercentageChange,
  useLeverage,
  useLimitPrice,
  useOrderCalculations,
  useOrderFormSubmit,
  useOrderPercentage,
  useOrderType,
  useTPOrSLSettings,
} from "@yieldxyz/perps-common/hooks";
import {
  formatAmount,
  formatPercentage,
  formatTPOrSLSettings,
  getMaxLeverage,
  getTokenLogo,
  round,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { Schema } from "effect";
import { ChevronRight, Info } from "lucide-react";
import { BackButton } from "../../../molecules/navigation/back-button";
import { WalletProtectedRoute } from "../../../molecules/navigation/wallet-protected-route";
import { OrderLoading } from "./loading";

export type OrderMode = "open" | "increase";

function OrderContent({
  wallet,
  marketRef,
  side,
  mode,
}: {
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
  wallet: WalletConnected;
  side: ApiTypes.PositionDtoSide;
  mode: OrderMode;
}) {
  const market = useAtomRef(marketRef);
  const leverageRanges = Schema.decodeSync(LeverageRangesSchema)(
    market.leverageRange,
  );
  const { orderType, setOrderType } = useOrderType();
  const { setLeverage } = useLeverage(leverageRanges);
  const { tpOrSLSettings, setTPOrSLSettings } = useTPOrSLSettings();
  const { limitPrice, setLimitPrice } = useLimitPrice();

  const isIncreaseMode = mode === "increase";

  const { form: OrderForm } = useAtomValue(orderFormAtom(leverageRanges));

  const { handlePercentageChange } = useHandlePercentageChange(
    wallet,
    leverageRanges,
  );
  const { percentage } = useOrderPercentage(wallet, leverageRanges);
  const calculations = useOrderCalculations(market, side, leverageRanges);
  const { submit, submitResult } = useOrderFormSubmit(leverageRanges);

  const symbol = market.baseAsset.symbol;
  const logo = market.baseAsset.logoURI ?? getTokenLogo(symbol);
  const maxLeverage = getMaxLeverage(leverageRanges);
  const isPositive = market.priceChangePercent24h >= 0;
  const currentPrice = market.markPrice;

  const handleSubmit = () => submit({ wallet, market, side });

  const isSubmitting = Result.isWaiting(submitResult);

  const { tp, sl } = formatTPOrSLSettings(tpOrSLSettings);

  return (
    <div className="flex flex-col gap-8">
      <div>
        {/* Header */}
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
                {symbol}
              </Text>
              <Text as="span" variant="badgeWhiteSmall">
                {maxLeverage}x
              </Text>
            </div>
            <div className="flex items-center gap-2">
              <Text as="span" variant="labelSmGray2Tight">
                {formatAmount(currentPrice)}
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
          {/* Order Type Selection Dialog - hidden in increase mode */}
          {!isIncreaseMode && (
            <OrderTypeDialog
              selectedType={orderType}
              onTypeSelect={setOrderType}
            />
          )}
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-6">
          {/* Amount Display - Now using AmountField */}
          <OrderForm.Initialize defaultValues={{ Amount: "0" }}>
            <div className="flex flex-col items-center gap-0 pt-6">
              <OrderForm.Amount />
              <Text
                as="p"
                variant="labelSmGray2Tight"
                className="text-center mt-4"
              >
                {round(calculations.cryptoAmount, 6).toString()} {symbol}
              </Text>
            </div>
          </OrderForm.Initialize>

          {/* Slider */}
          <div className="flex flex-col gap-2.5 pt-9">
            <PercentageSlider
              percentage={percentage}
              onPercentageChange={handlePercentageChange}
            />
          </div>

          {/* Settings Card */}
          <div className="pt-9">
            <Card>
              <LeverageDialog
                leverage={calculations.leverage}
                onLeverageChange={setLeverage}
                currentPrice={currentPrice}
                maxLeverage={maxLeverage}
                side={side}
              >
                <CardSection
                  position={isIncreaseMode ? "only" : "first"}
                  className="flex items-center gap-2 cursor-pointer hover:bg-white/8 transition-colors"
                >
                  <Text as="span" variant="labelSmGray2Tight">
                    Leverage
                  </Text>
                  <Info className="w-3.5 h-3.5 text-gray-2" />
                  <div className="flex-1" />
                  <Text as="span" variant="bodySmGray2Tight">
                    {calculations.leverage}x
                  </Text>
                  <ChevronRight className="w-4 h-4 text-gray-2" />
                </CardSection>
              </LeverageDialog>
              {!isIncreaseMode && orderType === "limit" && (
                <LimitPriceDialog
                  limitPrice={limitPrice}
                  onLimitPriceChange={setLimitPrice}
                  currentPrice={currentPrice}
                >
                  <CardSection
                    position="middle"
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/8 transition-colors"
                  >
                    <Text as="span" variant="labelSmGray2Tight">
                      Limit Price
                    </Text>
                    <Info className="w-3.5 h-3.5 text-gray-2" />
                    <div className="flex-1" />
                    <Text as="span" variant="bodySmGray2Tight">
                      {formatAmount(limitPrice ?? currentPrice)}
                    </Text>
                    <ChevronRight className="w-4 h-4 text-gray-2" />
                  </CardSection>
                </LimitPriceDialog>
              )}
              {!isIncreaseMode && (
                <TPOrSLDialog
                  settings={tpOrSLSettings}
                  onSettingsChange={setTPOrSLSettings}
                  entryPrice={currentPrice}
                  currentPrice={currentPrice}
                  liquidationPrice={calculations.liquidationPrice}
                  side={side}
                  isLiquidationPriceEstimate
                >
                  <CardSection
                    position="last"
                    className="flex items-center gap-2 cursor-pointer hover:bg-white/8 transition-colors"
                  >
                    <Text as="span" variant="labelSmGray2Tight">
                      Auto Close
                    </Text>
                    <Info className="w-3.5 h-3.5 text-gray-2" />
                    <div className="flex-1" />
                    <Text as="span" variant="bodySmGray2Tight">
                      {tp} {sl}
                    </Text>
                    <ChevronRight className="w-4 h-4 text-gray-2" />
                  </CardSection>
                </TPOrSLDialog>
              )}
            </Card>
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-6 gap-2">
            {/* Margin Row */}
            <div className="flex items-center justify-between">
              <Text as="span" variant="labelSmGray2Tight">
                Margin
              </Text>
              <Text as="span" variant="bodySmGray2Tight">
                {formatAmount(calculations.margin)}
              </Text>
            </div>

            <Divider />

            {/* Liquidation Price Row */}
            <div className="flex items-center justify-between">
              <Text as="span" variant="labelSmGray2Tight">
                Est. Liq. Price
              </Text>
              <Text as="span" variant="bodySmGray2Tight">
                {formatAmount(calculations.liquidationPrice)}
              </Text>
            </div>

            <Divider />

            {/* Fees Row */}
            <div className="flex items-center justify-between">
              <Text as="span" variant="labelSmGray2Tight">
                Fees
              </Text>
              <Text as="span" variant="bodySmGray2Tight">
                {formatAmount(calculations.fees)}
              </Text>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <Button
        onClick={handleSubmit}
        loading={isSubmitting}
        disabled={isSubmitting || calculations.amount <= 0}
        variant={side === "long" ? "accentGreen" : "accentRed"}
        size="lg"
        className="w-full text-base font-semibold"
      >
        {isSubmitting ? "Processing..." : side === "long" ? "Long" : "Short"}
      </Button>

      {/* Navigate to sign route on successful submit */}
      {Result.isSuccess(submitResult) && (
        <Navigate
          to="/order/$marketId/$side/sign"
          params={{ marketId: market.id, side }}
        />
      )}
    </div>
  );
}

function MarketOrderContent({
  wallet,
  side,
  mode,
}: {
  wallet: WalletConnected;
  side: ApiTypes.PositionDtoSide;
  mode: OrderMode;
}) {
  const { marketId } = useParams({ strict: false }) as { marketId: string };
  const market = useAtomValue(marketAtom(marketId));

  if (Result.isInitial(market)) {
    return <OrderLoading />;
  }

  if (!Result.isSuccess(market)) {
    return <Navigate to="/" />;
  }

  return (
    <OrderContent
      wallet={wallet}
      marketRef={market.value}
      side={side}
      mode={mode}
    />
  );
}

export function MarketOrder({
  side,
  mode = "open",
}: {
  side: ApiTypes.PositionDtoSide;
  mode: OrderMode;
}) {
  return (
    <WalletProtectedRoute>
      {(wallet) => (
        <MarketOrderContent wallet={wallet} side={side} mode={mode} />
      )}
    </WalletProtectedRoute>
  );
}
