import { Link, useParams } from "@tanstack/react-router";
import { ChevronDown, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { useMemo, useState } from "react";
import {
  DEFAULT_LEVERAGE,
  LeverageDialog,
} from "@/components/modules/PositionDetails/Order/leverage-modal";
import {
  ORDER_TYPE_OPTIONS,
  type OrderType,
  OrderTypeDialog,
} from "@/components/modules/PositionDetails/Order/order-type-modal";
import {
  AutoClosePosition,
  type AutoCloseSettings,
  defaultAutoCloseSettings,
  formatAutoCloseDisplay,
} from "@/components/molecules/auto-close-position";
import { Button } from "@/components/ui/button";
import { Card, CardSection } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";

const SLIDER_STOPS = [0, 25, 50, 75, 100];

const CRYPTO_LOGOS: Record<string, string> = {
  BTC: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png",
  ETH: "https://assets.coingecko.com/coins/images/279/small/ethereum.png",
  SOL: "https://assets.coingecko.com/coins/images/4128/small/solana.png",
};

// Mock asset data
const MOCK_ASSETS: Record<
  string,
  {
    symbol: string;
    name: string;
    leverage: string;
    price: string;
    priceNumber: number;
    change24h: number;
  }
> = {
  "1": {
    symbol: "BTC",
    name: "Bitcoin",
    leverage: "40x",
    price: "100,445.00",
    priceNumber: 100445,
    change24h: 5.6,
  },
  "1-hl": {
    symbol: "BTC",
    name: "Bitcoin",
    leverage: "40x",
    price: "100,245.00",
    priceNumber: 100245,
    change24h: 5.6,
  },
  "1-arb": {
    symbol: "BTC",
    name: "Bitcoin",
    leverage: "25x",
    price: "100,355.00",
    priceNumber: 100355,
    change24h: 2.7,
  },
  "2": {
    symbol: "ETH",
    name: "Ethereum",
    leverage: "25x",
    price: "3,104.78",
    priceNumber: 3104.78,
    change24h: 4.71,
  },
  "3": {
    symbol: "SOL",
    name: "Solana",
    leverage: "20x",
    price: "138.53",
    priceNumber: 138.53,
    change24h: 9.38,
  },
};

export function MarketOrder() {
  const { positionId } = useParams({
    from: "/position-details/$positionId/order",
  });
  const [amountPercent, setAmountPercent] = useState(50);
  const [orderType, setOrderType] = useState<OrderType>("market");
  const [isOrderTypeModalOpen, setIsOrderTypeModalOpen] = useState(false);
  const [leverage, setLeverage] = useState(DEFAULT_LEVERAGE);
  const [isLeverageModalOpen, setIsLeverageModalOpen] = useState(false);
  const [autoCloseSettings, setAutoCloseSettings] = useState<AutoCloseSettings>(
    defaultAutoCloseSettings,
  );
  const [isAutoCloseModalOpen, setIsAutoCloseModalOpen] = useState(false);

  // Get the label for the current order type
  const currentOrderTypeLabel =
    ORDER_TYPE_OPTIONS.find((opt) => opt.value === orderType)?.label ??
    "Market";

  // Get asset data (fallback to BTC if not found)
  const asset = MOCK_ASSETS[positionId] || MOCK_ASSETS["1"];
  const logo = CRYPTO_LOGOS[asset.symbol] || CRYPTO_LOGOS.BTC;
  const isPositive = asset.change24h >= 0;

  // Calculate values based on amount percentage
  const calculations = useMemo(() => {
    // Example: max margin is $200, so amount is percentage of that
    const maxMargin = 200;
    const margin = (amountPercent / 100) * maxMargin;
    const positionSize = margin * leverage;
    const cryptoAmount = margin / asset.priceNumber;

    // Liquidation price calculation (simplified)
    // For a long position with X leverage, liquidation occurs when price drops by ~(100/leverage)%
    const liquidationPrice = asset.priceNumber * (1 - (1 / leverage) * 0.8);

    // Fees (0.01% of position size)
    const fees = positionSize * 0.0001;

    return {
      margin,
      cryptoAmount,
      liquidationPrice,
      fees,
      leverage,
    };
  }, [amountPercent, asset.priceNumber, leverage]);

  // Handle stop click
  const handleStopClick = (value: number) => {
    setAmountPercent(value);
  };

  return (
    <div className="flex flex-col gap-28">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-4">
          <Link
            to="/position-details/$positionId"
            params={{ positionId }}
            className="flex items-center justify-center shrink-0"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </Link>
          <div className="relative shrink-0 size-9">
            <img
              src={logo}
              alt={asset.symbol}
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <div className="flex items-center gap-2.5">
              <span className="text-white font-semibold text-base tracking-tight">
                {asset.symbol}
              </span>
              <span className="bg-white/25 px-1.5 py-1 rounded-[5px] text-[11px] text-white leading-none">
                {asset.leverage}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-2 font-semibold text-sm tracking-tight">
                ${asset.price}
              </span>
              <span
                className={`font-semibold text-xs tracking-tight ${
                  isPositive ? "text-accent-green" : "text-accent-red"
                }`}
              >
                {isPositive ? "+" : ""}
                {asset.change24h.toFixed(2)}%
              </span>
            </div>
          </div>
          {/* Order Type Dropdown Button */}
          <button
            type="button"
            onClick={() => setIsOrderTypeModalOpen(true)}
            className="flex items-center gap-2 bg-[#161616] px-3.5 py-2.5 rounded-[11px] h-9"
          >
            <span className="text-white font-semibold text-sm tracking-tight">
              {currentOrderTypeLabel}
            </span>
            <ChevronDown className="w-3 h-3 text-white" />
          </button>
        </div>

        {/* Order Type Selection Modal */}
        <OrderTypeDialog
          open={isOrderTypeModalOpen}
          onOpenChange={setIsOrderTypeModalOpen}
          selectedType={orderType}
          onTypeSelect={setOrderType}
        />

        {/* Leverage Modal */}
        <LeverageDialog
          open={isLeverageModalOpen}
          onOpenChange={setIsLeverageModalOpen}
          leverage={leverage}
          onLeverageChange={setLeverage}
          currentPrice={asset.priceNumber}
        />

        {/* Auto Close Modal */}
        <AutoClosePosition
          open={isAutoCloseModalOpen}
          onOpenChange={setIsAutoCloseModalOpen}
          settings={autoCloseSettings}
          onSettingsChange={setAutoCloseSettings}
          entryPrice={asset.priceNumber}
          currentPrice={asset.priceNumber}
          liquidationPrice={calculations.liquidationPrice}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col pt-6">
          {/* Amount Display */}
          <div className="flex flex-col items-center gap-0 pt-6">
            <p className="text-white text-[44px] font-semibold tracking-[-1.76px] leading-none text-center">
              ${calculations.margin.toFixed(0)}
            </p>
            <p className="text-gray-2 text-sm font-semibold tracking-tight text-center mt-4">
              {calculations.cryptoAmount.toFixed(6)} {asset.symbol}
            </p>
          </div>

          {/* Slider */}
          <div className="flex flex-col gap-2.5 pt-9">
            <Slider
              value={amountPercent}
              onValueChange={(value) =>
                setAmountPercent(Array.isArray(value) ? value[0] : value)
              }
              min={0}
              max={100}
              thumbSize="round"
              showStops
              stops={SLIDER_STOPS}
              onStopClick={handleStopClick}
            />

            {/* Percentage Labels */}
            <div className="flex justify-between text-gray-2 text-xs font-semibold tracking-tight">
              {SLIDER_STOPS.map((stop) => (
                <button
                  type="button"
                  key={stop}
                  className={`cursor-pointer hover:text-white transition-colors ${
                    stop === 0
                      ? "w-12 text-left"
                      : stop === 100
                        ? "w-12 text-right"
                        : "flex-1 text-center"
                  }`}
                  onClick={() => handleStopClick(stop)}
                >
                  {stop}%
                </button>
              ))}
            </div>
          </div>

          {/* Settings Card */}
          <div className="pt-9">
            <Card>
              <CardSection
                position="first"
                className="flex items-center gap-2 cursor-pointer hover:bg-white/8 transition-colors"
                onClick={() => setIsLeverageModalOpen(true)}
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
              <CardSection
                position="last"
                className="flex items-center gap-2 cursor-pointer hover:bg-white/8 transition-colors"
                onClick={() => setIsAutoCloseModalOpen(true)}
              >
                <span className="text-gray-2 text-sm font-semibold tracking-tight">
                  Auto Close
                </span>
                <Info className="w-3.5 h-3.5 text-gray-2" />
                <div className="flex-1" />
                <span className="text-gray-2 text-sm font-normal tracking-tight">
                  {formatAutoCloseDisplay(autoCloseSettings)}
                </span>
                <ChevronRight className="w-4 h-4 text-gray-2" />
              </CardSection>
            </Card>
          </div>

          {/* Details Section */}
          <div className="flex flex-col pt-6">
            {/* Margin Row */}
            <div className="flex items-center justify-between py-4">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                Margin
              </span>
              <span className="text-gray-2 text-sm font-normal tracking-tight">
                ${calculations.margin.toFixed(2)}
              </span>
            </div>

            {/* Liquidation Price Row */}
            <div className="flex items-center justify-between py-[18px] border-t border-[#090909]">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                Liquidation Price
              </span>
              <span className="text-gray-2 text-sm font-normal tracking-tight">
                ${calculations.liquidationPrice.toFixed(2)}
              </span>
            </div>

            {/* Fees Row */}
            <div className="flex items-center justify-between py-[18px] border-t border-[#090909]">
              <span className="text-gray-2 text-sm font-semibold tracking-tight">
                Fees
              </span>
              <span className="text-gray-2 text-sm font-normal tracking-tight">
                ${calculations.fees.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Button */}
      <Button className="w-full h-14 bg-white text-black hover:bg-white/90 text-base font-semibold">
        Fund
      </Button>
    </div>
  );
}
