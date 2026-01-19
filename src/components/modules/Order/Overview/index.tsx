import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomValue,
} from "@effect-atom/atom-react";
import { Navigate, useParams } from "@tanstack/react-router";
import { Schema } from "effect";
import { ChevronDown, ChevronRight, Info } from "lucide-react";
import { useState } from "react";
import hyperliquidLogo from "@/assets/hyperliquid.png";
import { marketAtom } from "@/atoms/markets-atoms";
import { LeverageDialog } from "@/components/modules/Order/Overview/leverage-dialog";
import { LimitPriceDialog } from "@/components/modules/Order/Overview/limit-price-dialog";
import { OrderLoading } from "@/components/modules/Order/Overview/loading";
import {
  ORDER_TYPE_OPTIONS,
  OrderTypeDialog,
} from "@/components/modules/Order/Overview/order-type-dialog";
import {
  formAtom,
  LeverageRangesSchema,
  useLeverage,
  useLimitPrice,
  useOrderType,
  useTPOrSLSettings,
} from "@/components/modules/Order/Overview/state";
import { formatTPOrSLSettings } from "@/components/modules/Order/Overview/utils";
import { BackButton } from "@/components/molecules/navigation/back-button";
import { WalletProtectedRoute } from "@/components/molecules/navigation/wallet-protected-route";
import { PercentageSlider } from "@/components/molecules/percentage-slider";
import { TokenIcon } from "@/components/molecules/token-icon";
import { TPOrSLDialog } from "@/components/molecules/tp-sl-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardSection } from "@/components/ui/card";
import { Divider } from "@/components/ui/divider";
import { getMaxLeverage } from "@/domain/market";
import type { WalletConnected } from "@/domain/wallet";
import { formatAmount, formatPercentage, getTokenLogo } from "@/lib/utils";
import type { MarketDto } from "@/services/api-client/api-schemas";
import type { PositionDtoSide } from "@/services/api-client/client-factory";

function OrderContent({
  wallet,
  marketRef,
  side,
}: {
  marketRef: AtomRef.AtomRef<MarketDto>;
  wallet: WalletConnected;
  side: PositionDtoSide;
}) {
  const market = useAtomRef(marketRef);
  const leverageRanges = Schema.decodeSync(LeverageRangesSchema)(
    market.leverageRange,
  );
  const { orderType, setOrderType } = useOrderType();
  const { leverage, setLeverage } = useLeverage(leverageRanges);
  const { tpOrSLSettings, setTPOrSLSettings } = useTPOrSLSettings();
  const { limitPrice, setLimitPrice } = useLimitPrice();

  const {
    hooks: {
      useOrderPercentage,
      useOrderCalculations,
      useOrderForm,
      useHandlePercentageChange,
    },
    form: OrderForm,
  } = useAtomValue(formAtom(leverageRanges));

  const { handlePercentageChange } = useHandlePercentageChange(wallet);
  const { percentage } = useOrderPercentage(wallet, leverageRanges);
  const calculations = useOrderCalculations(market);
  const { submit, submitResult } = useOrderForm();

  const [isOrderTypeDialogOpen, setIsOrderTypeDialogOpen] = useState(false);
  const [isLeverageDialogOpen, setIsLeverageDialogOpen] = useState(false);
  const [isTPOrSLDialogOpen, setIsTPOrSLDialogOpen] = useState(false);
  const [isLimitPriceDialogOpen, setIsLimitPriceDialogOpen] = useState(false);

  const currentOrderTypeLabel =
    ORDER_TYPE_OPTIONS.find((opt) => opt.value === orderType)?.label ??
    "Market";

  const symbol = market.baseAsset.symbol;
  const logo = market.baseAsset.logoURI ?? getTokenLogo(symbol);
  const maxLeverage = getMaxLeverage(leverageRanges);
  const isPositive = market.priceChangePercent24h >= 0;
  const currentPrice = market.markPrice;

  const handleSubmit = () => submit({ wallet, market, side });

  const isSubmitting = Result.isWaiting(submitResult);

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
              <span className="text-white font-semibold text-base tracking-tight">
                {symbol}
              </span>
              <span className="bg-white/25 px-1.5 py-1 rounded-[5px] text-[11px] text-white leading-none">
                {maxLeverage}x
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-2 font-semibold text-sm tracking-tight">
                {formatAmount(currentPrice)}
              </span>
              <span
                className={`font-semibold text-xs tracking-tight ${
                  isPositive ? "text-accent-green" : "text-accent-red"
                }`}
              >
                {isPositive ? "+" : ""}
                {formatPercentage(market.priceChangePercent24h)}
              </span>
            </div>
          </div>
          {/* Order Type Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsOrderTypeDialogOpen(true)}
            className="flex items-center gap-2 bg-[#161616] px-3.5 py-2.5 rounded-[11px] h-9"
          >
            <span className="text-white font-semibold text-sm tracking-tight">
              {currentOrderTypeLabel}
            </span>
            <ChevronDown className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Order Type Selection Dialog */}
        {isOrderTypeDialogOpen && (
          <OrderTypeDialog
            onOpenChange={setIsOrderTypeDialogOpen}
            selectedType={orderType}
            onTypeSelect={setOrderType}
          />
        )}

        {/* Leverage Dialog */}
        {isLeverageDialogOpen && (
          <LeverageDialog
            onOpenChange={setIsLeverageDialogOpen}
            leverage={leverage}
            onLeverageChange={setLeverage}
            currentPrice={currentPrice}
            maxLeverage={maxLeverage}
          />
        )}

        {/* Auto Close Dialog */}
        {isTPOrSLDialogOpen && (
          <TPOrSLDialog
            onOpenChange={setIsTPOrSLDialogOpen}
            settings={tpOrSLSettings}
            onSettingsChange={setTPOrSLSettings}
            entryPrice={currentPrice}
            currentPrice={currentPrice}
            liquidationPrice={calculations.liquidationPrice}
          />
        )}

        {/* Limit Price Dialog */}
        {isLimitPriceDialogOpen && (
          <LimitPriceDialog
            onOpenChange={setIsLimitPriceDialogOpen}
            limitPrice={limitPrice}
            onLimitPriceChange={setLimitPrice}
            currentPrice={currentPrice}
          />
        )}

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-6">
          {/* Amount Display - Now using AmountField */}
          <OrderForm.Initialize defaultValues={{ Amount: "0" }}>
            <div className="flex flex-col items-center gap-0 pt-6">
              <OrderForm.Amount />
              <p className="text-gray-2 text-sm font-semibold tracking-tight text-center mt-4">
                {calculations.cryptoAmount.toFixed(6)} {symbol}
              </p>
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
              <CardSection
                position="first"
                className="flex items-center gap-2 cursor-pointer hover:bg-white/8 transition-colors"
                onClick={() => setIsLeverageDialogOpen(true)}
              >
                <span className="text-gray-2 text-sm font-semibold tracking-tight">
                  Leverage
                </span>
                <Info className="w-3.5 h-3.5 text-gray-2" />
                <div className="flex-1" />
                <span className="text-gray-2 text-sm font-normal tracking-tight">
                  {calculations.leverage}x
                </span>
                <ChevronRight className="w-4 h-4 text-gray-2" />
              </CardSection>
              {orderType === "limit" && (
                <CardSection
                  position="middle"
                  className="flex items-center gap-2 cursor-pointer hover:bg-white/8 transition-colors"
                  onClick={() => setIsLimitPriceDialogOpen(true)}
                >
                  <span className="text-gray-2 text-sm font-semibold tracking-tight">
                    Limit Price
                  </span>
                  <Info className="w-3.5 h-3.5 text-gray-2" />
                  <div className="flex-1" />
                  <span className="text-gray-2 text-sm font-normal tracking-tight">
                    {formatAmount(limitPrice ?? currentPrice)}
                  </span>
                  <ChevronRight className="w-4 h-4 text-gray-2" />
                </CardSection>
              )}
              <CardSection
                position="last"
                className="flex items-center gap-2 cursor-pointer hover:bg-white/8 transition-colors"
                onClick={() => setIsTPOrSLDialogOpen(true)}
              >
                <span className="text-gray-2 text-sm font-semibold tracking-tight">
                  Auto Close
                </span>
                <Info className="w-3.5 h-3.5 text-gray-2" />
                <div className="flex-1" />
                <span className="text-gray-2 text-sm font-normal tracking-tight">
                  {formatTPOrSLSettings(tpOrSLSettings)}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-2" />
              </CardSection>
            </Card>
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-6 gap-2">
            {/* Margin Row */}
            <div className="flex items-center justify-between">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                Margin
              </span>
              <span className="text-gray-2 text-sm font-normal tracking-tight">
                {formatAmount(calculations.margin)}
              </span>
            </div>

            <Divider />

            {/* Liquidation Price Row */}
            <div className="flex items-center justify-between">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                Liquidation Price
              </span>
              <span className="text-gray-2 text-sm font-normal tracking-tight">
                {formatAmount(calculations.liquidationPrice)}
              </span>
            </div>

            <Divider />

            {/* Fees Row */}
            <div className="flex items-center justify-between">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                Fees
              </span>
              <span className="text-gray-2 text-sm font-normal tracking-tight">
                {formatAmount(calculations.fees)}
              </span>
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
        className="w-full h-14 text-base font-semibold"
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
}: {
  wallet: WalletConnected;
  side: PositionDtoSide;
}) {
  const { marketId } = useParams({ strict: false }) as { marketId: string };
  const market = useAtomValue(marketAtom(marketId));

  if (Result.isWaiting(market)) {
    return <OrderLoading />;
  }

  if (!Result.isSuccess(market)) {
    return <Navigate to="/" />;
  }

  return <OrderContent wallet={wallet} marketRef={market.value} side={side} />;
}

export function MarketOrder({ side }: { side: PositionDtoSide }) {
  return (
    <WalletProtectedRoute>
      {(wallet) => <MarketOrderContent wallet={wallet} side={side} />}
    </WalletProtectedRoute>
  );
}
