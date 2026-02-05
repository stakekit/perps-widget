import {
  type AtomRef,
  Result,
  useAtomRef,
  useAtomValue,
} from "@effect-atom/atom-react";
import {
  LeverageRangesSchema,
  orderFormAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  Button,
  LeverageDialog,
  LimitPriceDialog,
  PercentageSlider,
  Text,
  TPOrSLDialog,
} from "@yieldxyz/perps-common/components";
import {
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import {
  useCurrentPosition,
  useHandlePercentageChange,
  useLeverage,
  useLimitPrice,
  useOrderCalculations,
  useOrderFormSubmit,
  useOrderPercentage,
  useOrderSide,
  useOrderType,
  useProviderBalance,
  useTPOrSLSettings,
} from "@yieldxyz/perps-common/hooks";
import {
  cn,
  formatAmount,
  formatTPOrSLSettings,
  getMaxLeverage,
  round,
} from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { Schema } from "effect";
import { ChevronDown, Info } from "lucide-react";
import { selectedMarketAtom } from "../../../../atoms/selected-market-atom";

interface OrderFormProps {
  className?: string;
}

export function OrderForm({ className }: OrderFormProps) {
  const wallet = useAtomValue(walletAtom).pipe(Result.getOrElse(() => null));
  const marketResult = useAtomValue(selectedMarketAtom);

  if (!Result.isSuccess(marketResult)) {
    return <OrderFormLoading className={className} />;
  }

  if (!isWalletConnected(wallet)) {
    return (
      <OrderFormDisconnected
        className={className}
        marketRef={marketResult.value}
      />
    );
  }

  return (
    <OrderFormContent
      className={className}
      wallet={wallet}
      marketRef={marketResult.value}
    />
  );
}

function OrderFormLoading({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "flex flex-col w-[350px] bg-content-background rounded-[10px] h-full items-center justify-center",
        className,
      )}
    >
      <Text variant="bodySmGray2Tight">Loading market...</Text>
    </div>
  );
}

function OrderFormDisconnected({
  className,
  marketRef,
}: {
  className?: string;
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
}) {
  const market = useAtomRef(marketRef);
  const { orderType, setOrderType } = useOrderType();
  const { orderSide, setOrderSide } = useOrderSide();

  const leverageRanges = Schema.decodeSync(LeverageRangesSchema)(
    market.leverageRange,
  );
  const { leverage } = useLeverage(leverageRanges);
  const { tpOrSLSettings } = useTPOrSLSettings();

  const maxLeverage = getMaxLeverage(leverageRanges);

  return (
    <div
      className={cn(
        "flex flex-col w-[350px] bg-content-background rounded-[10px] h-full",
        className,
      )}
    >
      {/* Market/Limit Tabs */}
      <OrderTypeTabs orderType={orderType} setOrderType={setOrderType} />

      <div className="flex flex-col p-3 gap-5">
        {/* Buy/Sell Toggle */}
        <OrderSideToggle orderSide={orderSide} setOrderSide={setOrderSide} />

        {/* Available to Trade & Current Position */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Text variant="labelSmWhiteNeg" className="font-semibold text-xs">
              Available to Trade
            </Text>
            <Text variant="bodySmWhiteNeg" className="text-xs">
              --
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text variant="labelSmWhiteNeg" className="font-semibold text-xs">
              Current Position
            </Text>
            <Text className="text-xs text-gray-2">--</Text>
          </div>
        </div>

        {/* Amount Display */}
        <div className="flex flex-col items-center gap-0 py-4">
          <Text className="text-white text-[44px] font-semibold tracking-[-1.76px] leading-none">
            $0
          </Text>
          <Text as="p" variant="labelSmGray2Tight" className="text-center mt-4">
            0.000000 {market.baseAsset.symbol}
          </Text>
        </div>

        {/* Percentage Slider (disabled) */}
        <PercentageSlider percentage={0} onPercentageChange={() => {}} />

        {/* Leverage */}
        <SettingsRow
          label="Leverage"
          value={`${leverage}x`}
          maxLeverage={maxLeverage}
        />

        {/* Limit Price (when limit order) */}
        {orderType === "limit" && (
          <SettingsRow
            label="Limit Price"
            value={formatAmount(market.markPrice)}
          />
        )}

        {/* Advanced Orders */}
        <SettingsRow
          label="Advanced Orders"
          value={formatTPOrSLSettings(tpOrSLSettings, orderSide)}
        />
      </div>

      {/* Order Details */}
      <div className="flex flex-col">
        <OrderDetailRow label="Est. Liq. Price" value="--" />
        <OrderDetailRow label="Margin" value="--" />
        <OrderDetailRow label="Fees" value="--" isLast />
      </div>

      {/* Connect Wallet Button */}
      <div className="p-3 border-t border-[#1d1d1d] mt-auto">
        <Button
          variant="accentGreen"
          className="w-full h-9 rounded-[10px] text-[15px] font-semibold text-black"
          disabled
        >
          Connect Wallet
        </Button>
      </div>
    </div>
  );
}

function OrderFormContent({
  className,
  wallet,
  marketRef,
}: {
  className?: string;
  wallet: WalletConnected;
  marketRef: AtomRef.AtomRef<ApiTypes.MarketDto>;
}) {
  const market = useAtomRef(marketRef);
  const leverageRanges = Schema.decodeSync(LeverageRangesSchema)(
    market.leverageRange,
  );

  const { orderType, setOrderType } = useOrderType();
  const { orderSide, setOrderSide } = useOrderSide();
  const { setLeverage } = useLeverage(leverageRanges);
  const { tpOrSLSettings, setTPOrSLSettings } = useTPOrSLSettings();
  const { limitPrice, setLimitPrice } = useLimitPrice();
  const { providerBalance } = useProviderBalance(wallet);
  const { currentPosition } = useCurrentPosition(wallet, market.id);

  const { form: OrderFormComponent } = useAtomValue(
    orderFormAtom(leverageRanges),
  );

  const { submit, submitResult } = useOrderFormSubmit(leverageRanges);
  const { handlePercentageChange } = useHandlePercentageChange(
    wallet,
    leverageRanges,
  );
  const { percentage } = useOrderPercentage(wallet, leverageRanges);
  const calculations = useOrderCalculations(market, orderSide, leverageRanges);

  const maxLeverage = getMaxLeverage(leverageRanges);
  const currentPrice = market.markPrice;
  const symbol = market.baseAsset.symbol;

  const availableBalance = providerBalance?.availableBalance ?? 0;

  // Format current position display
  const currentPositionDisplay = currentPosition
    ? `${currentPosition.side === "long" ? "+" : "-"}${currentPosition.size} ${symbol}`
    : "--";

  const handleSubmit = () => {
    submit({ wallet, market, side: orderSide });
  };

  return (
    <div
      className={cn(
        "flex flex-col w-[350px] bg-content-background rounded-[10px] h-full",
        className,
      )}
    >
      {/* Market/Limit Tabs */}
      <OrderTypeTabs orderType={orderType} setOrderType={setOrderType} />

      <div className="flex flex-col p-3 gap-3">
        {/* Buy/Sell Toggle */}
        <OrderSideToggle orderSide={orderSide} setOrderSide={setOrderSide} />

        {/* Available to Trade & Current Position */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Text variant="labelSmWhiteNeg" className="font-semibold text-xs">
              Available to Trade
            </Text>
            <Text variant="bodySmWhiteNeg" className="text-xs">
              {formatAmount(availableBalance)}
            </Text>
          </div>
          <div className="flex items-center justify-between">
            <Text variant="labelSmWhiteNeg" className="font-semibold text-xs">
              Current Position
            </Text>
            <Text
              className={cn(
                "text-xs",
                currentPosition
                  ? currentPosition.side === "long"
                    ? "text-accent-green"
                    : "text-accent-red"
                  : "text-gray-2",
              )}
            >
              {currentPositionDisplay}
            </Text>
          </div>
        </div>

        {/* Amount Input */}
        <OrderFormComponent.Initialize defaultValues={{ Amount: "0" }}>
          <div className="flex flex-col items-center gap-0 py-4">
            <OrderFormComponent.Amount />
            <Text
              as="p"
              variant="labelSmGray2Tight"
              className="text-center mt-4"
            >
              {round(calculations.cryptoAmount, 6).toString()} {symbol}
            </Text>
          </div>
        </OrderFormComponent.Initialize>

        {/* Percentage Slider */}
        <PercentageSlider
          percentage={percentage}
          onPercentageChange={handlePercentageChange}
        />

        {/* Leverage */}
        <LeverageDialog
          leverage={calculations.leverage}
          onLeverageChange={setLeverage}
          currentPrice={currentPrice}
          maxLeverage={maxLeverage}
          side={orderSide}
        >
          <button
            type="button"
            className="flex items-center justify-between h-9 px-4 bg-background rounded-[10px] hover:bg-[#252525] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Text className="text-xs text-white font-semibold">Leverage</Text>
              <Info className="size-3.5 text-white/40" />
            </div>
            <div className="flex items-center gap-1.5">
              <Text className="text-sm text-white font-bold">
                {calculations.leverage}x
              </Text>
              <ChevronDown className="size-5 text-white/60" />
            </div>
          </button>
        </LeverageDialog>

        {/* Limit Price (when limit order) */}
        {orderType === "limit" && (
          <LimitPriceDialog
            limitPrice={limitPrice}
            onLimitPriceChange={setLimitPrice}
            currentPrice={currentPrice}
          >
            <button
              type="button"
              className="flex items-center justify-between h-9 px-4 bg-background rounded-[10px] hover:bg-[#252525] transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <Text className="text-xs text-white font-semibold">
                  Limit Price
                </Text>
                <Info className="size-3.5 text-white/40" />
              </div>
              <div className="flex items-center gap-1.5">
                <Text className="text-sm text-white font-bold">
                  {formatAmount(limitPrice ?? currentPrice)}
                </Text>
                <ChevronDown className="size-5 text-white/60" />
              </div>
            </button>
          </LimitPriceDialog>
        )}

        {/* Advanced Orders (TP/SL) */}
        <TPOrSLDialog
          settings={tpOrSLSettings}
          onSettingsChange={setTPOrSLSettings}
          entryPrice={currentPrice}
          currentPrice={currentPrice}
          liquidationPrice={calculations.liquidationPrice}
          side={orderSide}
          isLiquidationPriceEstimate
        >
          <button
            type="button"
            className="flex items-center justify-between h-9 px-4 bg-background rounded-[10px] hover:bg-[#252525] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Text className="text-xs text-white font-semibold">
                Advanced Orders
              </Text>
              <Info className="size-3.5 text-white/40" />
            </div>
            <div className="flex items-center gap-1.5">
              <Text className="text-sm text-white font-bold">
                {formatTPOrSLSettings(tpOrSLSettings, orderSide)}
              </Text>
              <ChevronDown className="size-5 text-white/60" />
            </div>
          </button>
        </TPOrSLDialog>
      </div>

      {/* Order Details */}
      <div className="flex flex-col">
        <OrderDetailRow
          label="Est. Liq. Price"
          value={formatAmount(calculations.liquidationPrice)}
        />
        <OrderDetailRow
          label="Margin"
          value={formatAmount(calculations.margin)}
        />
        <OrderDetailRow
          label="Fees"
          value={formatAmount(calculations.fees)}
          isLast
        />
      </div>

      {/* Place Order Button */}
      <div className="p-3 border-t border-[#1d1d1d] mt-auto">
        <Button
          variant={orderSide === "long" ? "accentGreen" : "accentRed"}
          className="w-full text-[15px] font-semibold text-black"
          disabled={calculations.amount <= 0 || submitResult.waiting}
          loading={submitResult.waiting}
          onClick={handleSubmit}
        >
          {orderSide === "long" ? "Long" : "Short"}
        </Button>
      </div>
    </div>
  );
}

// Shared Components

function OrderTypeTabs({
  orderType,
  setOrderType,
}: {
  orderType: "market" | "limit";
  setOrderType: (type: "market" | "limit") => void;
}) {
  return (
    <div className="flex border-b border-backbg-background">
      <button
        type="button"
        onClick={() => setOrderType("market")}
        className={cn(
          "flex-1 py-3.5 text-xs font-normal text-center transition-colors border-b",
          orderType === "market"
            ? "text-white border-white"
            : "text-[#707070] border-transparent hover:text-white/60",
        )}
      >
        Market
      </button>
      <button
        type="button"
        onClick={() => setOrderType("limit")}
        className={cn(
          "flex-1 py-3.5 text-xs font-normal text-center transition-colors border-b",
          orderType === "limit"
            ? "text-white border-white"
            : "text-[#707070] border-transparent hover:text-white/60",
        )}
      >
        Limit
      </button>
    </div>
  );
}

function OrderSideToggle({
  orderSide,
  setOrderSide,
}: {
  orderSide: "long" | "short";
  setOrderSide: (side: "long" | "short") => void;
}) {
  return (
    <div className="flex gap-0.5 p-0.5 bg-background rounded-[10px]">
      <Button
        onClick={() => setOrderSide("long")}
        className={cn(
          "flex-1 h-9 rounded-[10px] text-[15px] font-semibold transition-all",
          orderSide === "long"
            ? "bg-white text-black"
            : "bg-transparent text-white hover:bg-white/5",
        )}
      >
        Buy / Long
      </Button>
      <Button
        onClick={() => setOrderSide("short")}
        className={cn(
          "flex-1 h-9 rounded-[10px] text-[15px] font-semibold transition-all",
          orderSide === "short"
            ? "bg-white text-black"
            : "bg-transparent text-white hover:bg-white/5",
        )}
      >
        Sell / Short
      </Button>
    </div>
  );
}

function SettingsRow({
  label,
  value,
  maxLeverage,
}: {
  label: string;
  value: string;
  maxLeverage?: number;
}) {
  return (
    <div className="flex items-center justify-between h-9 px-4 bg-background rounded-[10px]">
      <div className="flex items-center gap-2">
        <Text className="text-xs text-white font-semibold">{label}</Text>
        <Info className="size-3.5 text-white/40" />
      </div>
      <div className="flex items-center gap-1.5">
        <Text className="text-sm text-white font-bold">{value}</Text>
        {maxLeverage && (
          <Text className="text-xs text-gray-2">/ {maxLeverage}x</Text>
        )}
      </div>
    </div>
  );
}

interface OrderDetailRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

function OrderDetailRow({ label, value, isLast }: OrderDetailRowProps) {
  return (
    <div
      className={cn(
        "flex items-center justify-between px-3 py-[15px] border-t border-backbg-background",
        isLast && "border-b",
      )}
    >
      <Text className="text-xs text-white font-semibold tracking-tight">
        {label}
      </Text>
      <Text className="text-xs text-white tracking-tight">{value}</Text>
    </div>
  );
}
