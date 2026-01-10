import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

// Leverage slider config
const MIN_LEVERAGE = 1;
const MAX_LEVERAGE = 40;
export const DEFAULT_LEVERAGE = 40;
const LEVERAGE_STOPS = [MIN_LEVERAGE, 20, MAX_LEVERAGE];

// Quick leverage adjustment percentages
const LEVERAGE_QUICK_ADJUSTMENTS = [-1, -2, -5, -10];

interface LeverageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leverage: number;
  onLeverageChange: (leverage: number) => void;
  currentPrice: number;
}

export function LeverageDialog({
  open,
  onOpenChange,
  leverage,
  onLeverageChange,
  currentPrice,
}: LeverageDialogProps) {
  const [localLeverage, setLocalLeverage] = useState(leverage);

  // Calculate leverage percentage for slider (1x = 0%, 40x = 100%)
  const leveragePercent =
    ((localLeverage - MIN_LEVERAGE) / (MAX_LEVERAGE - MIN_LEVERAGE)) * 100;

  // Calculate liquidation price based on leverage
  const liquidationPrice = currentPrice * (1 - (1 / localLeverage) * 0.8);

  // Calculate margin amount based on leverage (example calculation)
  const marginAmount = Math.round(210 * (localLeverage / MAX_LEVERAGE));

  // Calculate price drop percentage until liquidation
  const priceDropPercent = (
    ((currentPrice - liquidationPrice) / currentPrice) *
    100
  ).toFixed(1);

  // Handle quick adjustment
  const handleQuickAdjust = (percent: number) => {
    const adjustment = Math.round(localLeverage * (percent / 100));
    const newLeverage = Math.max(
      MIN_LEVERAGE,
      Math.min(MAX_LEVERAGE, localLeverage + adjustment),
    );
    setLocalLeverage(newLeverage);
  };

  // Handle stop click
  const handleStopClick = (stopValue: number) => {
    setLocalLeverage(stopValue);
  };

  // Handle confirm
  const handleConfirm = () => {
    onLeverageChange(localLeverage);
    onOpenChange(false);
  };

  // Reset local state when dialog opens
  const handleOpenChange = (newOpen: boolean) => {
    if (newOpen) {
      setLocalLeverage(leverage);
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <div className="flex flex-col gap-2 pb-5 pt-6 px-6">
            {/* Header */}
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-white tracking-[-0.42px] w-[90px]">
                Leverage
              </span>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="p-1 rounded-full cursor-pointer hover:bg-white/5 transition-colors"
              >
                <X className="size-6 text-gray-2" />
              </button>
            </div>

            {/* Large Leverage Display */}
            <div className="flex flex-col items-center gap-2.5 h-[110px] justify-center">
              <p className="text-white text-[44px] font-semibold tracking-[-1.76px] leading-none text-center">
                €{marginAmount}
              </p>
            </div>

            {/* Warning Banner */}
            <div className="flex items-center justify-center h-11 bg-accent-red/30 rounded-[10px] px-4">
              <p className="text-white text-sm font-normal tracking-[-0.42px] text-right">
                You will be liquidated if price drops by {priceDropPercent}%
              </p>
            </div>

            {/* Info Card */}
            <div className="flex flex-col gap-2 pt-2.5">
              <div className="h-2.5" />
              <div className="flex flex-col">
                <div className="bg-white/5 flex items-center justify-between p-4 rounded-t-2xl">
                  <span className="text-gray-2 text-sm font-semibold tracking-[-0.42px]">
                    Liquidation Price
                  </span>
                  <span className="text-accent-red text-sm font-normal tracking-[-0.42px]">
                    $
                    {liquidationPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </span>
                </div>
                <div className="bg-white/5 flex items-center justify-between px-4 py-[18px] rounded-b-2xl border-t border-[#090909]">
                  <span className="text-gray-2 text-sm font-semibold tracking-[-0.42px]">
                    Current price
                  </span>
                  <span className="text-gray-2 text-sm font-normal tracking-[-0.42px]">
                    ${currentPrice.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Leverage Slider */}
            <div className="flex flex-col gap-2.5 py-6">
              <Slider
                value={leveragePercent}
                onValueChange={(value) => {
                  const v = Array.isArray(value) ? value[0] : value;
                  const leverageValue = Math.round(
                    MIN_LEVERAGE + (v / 100) * (MAX_LEVERAGE - MIN_LEVERAGE),
                  );
                  setLocalLeverage(leverageValue);
                }}
                min={0}
                max={100}
                showStops
                stops={LEVERAGE_STOPS.map(
                  (stop) =>
                    ((stop - MIN_LEVERAGE) / (MAX_LEVERAGE - MIN_LEVERAGE)) *
                    100,
                )}
                onStopClick={(stopPercent) => {
                  const leverageValue = Math.round(
                    MIN_LEVERAGE +
                      (stopPercent / 100) * (MAX_LEVERAGE - MIN_LEVERAGE),
                  );
                  setLocalLeverage(leverageValue);
                }}
              />

              {/* Leverage Labels */}
              <div className="flex justify-between text-gray-2 text-xs font-semibold tracking-[-0.36px]">
                {LEVERAGE_STOPS.map((stop, index) => (
                  <button
                    type="button"
                    key={stop}
                    className={`cursor-pointer hover:text-white transition-colors ${
                      index === 0
                        ? "w-12 text-left"
                        : index === LEVERAGE_STOPS.length - 1
                          ? "w-12 text-right"
                          : "flex-1 text-center"
                    }`}
                    onClick={() => handleStopClick(stop)}
                  >
                    {stop}x
                  </button>
                ))}
              </div>
            </div>

            {/* Quick Adjustment Buttons */}
            <div className="flex gap-2 h-[38px]">
              {LEVERAGE_QUICK_ADJUSTMENTS.map((percent) => (
                <button
                  key={percent}
                  type="button"
                  onClick={() => handleQuickAdjust(percent)}
                  className="flex-1 flex items-center justify-center h-9 bg-white/5 rounded-[10px] text-gray-2 text-sm font-normal tracking-[-0.42px] hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {percent}%
                </button>
              ))}
            </div>

            {/* Confirm Button */}
            <Button
              onClick={handleConfirm}
              className="w-full h-14 bg-white text-black hover:bg-white/90 text-base font-semibold mt-4"
            >
              Set {localLeverage}x
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
