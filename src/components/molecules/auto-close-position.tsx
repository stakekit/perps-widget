import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardSection } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";

const TAKE_PROFIT_OPTIONS = ["Off", "+10%", "+25%", "+50%", "+100%"] as const;
const STOP_LOSS_OPTIONS = ["Off", "-10%", "-25%", "-50%", "-100%"] as const;

type TakeProfitOption = (typeof TAKE_PROFIT_OPTIONS)[number];
type StopLossOption = (typeof STOP_LOSS_OPTIONS)[number];

export interface AutoCloseSettings {
  takeProfit: {
    option: TakeProfitOption;
    triggerPrice: string;
    percentProfit: string;
  };
  stopLoss: {
    option: StopLossOption;
    triggerPrice: string;
    percentLoss: string;
  };
}

export const defaultAutoCloseSettings: AutoCloseSettings = {
  takeProfit: {
    option: "Off",
    triggerPrice: "",
    percentProfit: "",
  },
  stopLoss: {
    option: "Off",
    triggerPrice: "",
    percentLoss: "",
  },
};

interface AutoCloseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: AutoCloseSettings;
  onSettingsChange: (settings: AutoCloseSettings) => void;
  entryPrice: number;
  currentPrice: number;
  liquidationPrice: number;
}

export function AutoClosePosition({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  entryPrice,
  currentPrice,
  liquidationPrice,
}: AutoCloseDialogProps) {
  // Local state for editing
  const [localSettings, setLocalSettings] =
    useState<AutoCloseSettings>(settings);

  // Sync local state when dialog opens
  useEffect(() => {
    if (open) {
      setLocalSettings(settings);
    }
  }, [open, settings]);

  // Calculate trigger price from percentage option
  const calculateTriggerPrice = (
    option: TakeProfitOption | StopLossOption,
    basePrice: number,
  ): string => {
    if (option === "Off") return "";
    const percentMatch = option.match(/([+-]?\d+)%/);
    if (!percentMatch) return "";
    const percent = Number.parseFloat(percentMatch[1]);
    const price = basePrice * (1 + percent / 100);
    return price.toFixed(2);
  };

  // Handle take profit option change
  const handleTakeProfitOptionChange = (option: TakeProfitOption) => {
    const triggerPrice = calculateTriggerPrice(option, entryPrice);
    const percentProfit =
      option === "Off" ? "" : option.replace("+", "").replace("%", "");

    setLocalSettings((prev) => ({
      ...prev,
      takeProfit: {
        option,
        triggerPrice,
        percentProfit,
      },
    }));
  };

  // Handle stop loss option change
  const handleStopLossOptionChange = (option: StopLossOption) => {
    const triggerPrice = calculateTriggerPrice(option, entryPrice);
    const percentLoss =
      option === "Off" ? "" : option.replace("-", "").replace("%", "");

    setLocalSettings((prev) => ({
      ...prev,
      stopLoss: {
        option,
        triggerPrice,
        percentLoss,
      },
    }));
  };

  // Handle take profit trigger price change
  const handleTakeProfitTriggerPriceChange = (value: string) => {
    const price = Number.parseFloat(value);
    let percentProfit = "";
    let option: TakeProfitOption = "Off";

    if (!Number.isNaN(price) && price > 0 && entryPrice > 0) {
      const percent = ((price - entryPrice) / entryPrice) * 100;
      percentProfit = percent.toFixed(1);

      // Check if it matches a preset
      const matchingOption = TAKE_PROFIT_OPTIONS.find((opt) => {
        if (opt === "Off") return false;
        const optPercent = Number.parseFloat(
          opt.replace("+", "").replace("%", ""),
        );
        return Math.abs(percent - optPercent) < 0.5;
      });
      option = matchingOption || "Off";
    }

    setLocalSettings((prev) => ({
      ...prev,
      takeProfit: {
        option,
        triggerPrice: value,
        percentProfit,
      },
    }));
  };

  // Handle take profit percent change
  const handleTakeProfitPercentChange = (value: string) => {
    const percent = Number.parseFloat(value);
    let triggerPrice = "";
    let option: TakeProfitOption = "Off";

    if (!Number.isNaN(percent) && entryPrice > 0) {
      triggerPrice = (entryPrice * (1 + percent / 100)).toFixed(2);

      // Check if it matches a preset
      const matchingOption = TAKE_PROFIT_OPTIONS.find((opt) => {
        if (opt === "Off") return false;
        const optPercent = Number.parseFloat(
          opt.replace("+", "").replace("%", ""),
        );
        return Math.abs(percent - optPercent) < 0.5;
      });
      option = matchingOption || "Off";
    }

    setLocalSettings((prev) => ({
      ...prev,
      takeProfit: {
        option,
        triggerPrice,
        percentProfit: value,
      },
    }));
  };

  // Handle stop loss trigger price change
  const handleStopLossTriggerPriceChange = (value: string) => {
    const price = Number.parseFloat(value);
    let percentLoss = "";
    let option: StopLossOption = "Off";

    if (!Number.isNaN(price) && price > 0 && entryPrice > 0) {
      const percent = Math.abs(((price - entryPrice) / entryPrice) * 100);
      percentLoss = percent.toFixed(1);

      // Check if it matches a preset
      const matchingOption = STOP_LOSS_OPTIONS.find((opt) => {
        if (opt === "Off") return false;
        const optPercent = Number.parseFloat(
          opt.replace("-", "").replace("%", ""),
        );
        return Math.abs(percent - optPercent) < 0.5;
      });
      option = matchingOption || "Off";
    }

    setLocalSettings((prev) => ({
      ...prev,
      stopLoss: {
        option,
        triggerPrice: value,
        percentLoss,
      },
    }));
  };

  // Handle stop loss percent change
  const handleStopLossPercentChange = (value: string) => {
    const percent = Number.parseFloat(value);
    let triggerPrice = "";
    let option: StopLossOption = "Off";

    if (!Number.isNaN(percent) && entryPrice > 0) {
      triggerPrice = (entryPrice * (1 - percent / 100)).toFixed(2);

      // Check if it matches a preset
      const matchingOption = STOP_LOSS_OPTIONS.find((opt) => {
        if (opt === "Off") return false;
        const optPercent = Number.parseFloat(
          opt.replace("-", "").replace("%", ""),
        );
        return Math.abs(percent - optPercent) < 0.5;
      });
      option = matchingOption || "Off";
    }

    setLocalSettings((prev) => ({
      ...prev,
      stopLoss: {
        option,
        triggerPrice,
        percentLoss: value,
      },
    }));
  };

  // Handle done button
  const handleDone = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          {/* Top Section */}
          <div className="flex flex-col gap-[25px] pb-5 pt-6 px-6 rounded-t-[15px]">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white tracking-[-0.42px] leading-tight flex-1">
                  Take profit and stop loss
                </span>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-1 rounded-full cursor-pointer hover:bg-white/5 transition-colors"
                >
                  <X className="size-6 text-gray-2" />
                </button>
              </div>
              <p className="text-sm text-white font-normal tracking-[-0.42px] leading-tight">
                Pick a percentage gain or loss, or enter a custom trigger price
                to automatically close your position.
              </p>
            </div>

            {/* Info Card */}
            <Card>
              <CardSection position="first" className="flex items-center gap-2">
                <span className="text-gray-2 text-sm font-semibold tracking-[-0.42px] w-[95px]">
                  Entry price
                </span>
                <div className="flex-1 flex justify-end">
                  <span className="text-gray-2 text-sm font-normal tracking-[-0.42px]">
                    $
                    {entryPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </CardSection>
              <CardSection
                position="middle"
                className="flex items-center gap-2"
              >
                <span className="text-gray-2 text-sm font-semibold tracking-[-0.42px]">
                  Current price
                </span>
                <div className="flex-1 flex justify-end">
                  <span className="text-gray-2 text-sm font-normal tracking-[-0.42px]">
                    $
                    {currentPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </CardSection>
              <CardSection position="last" className="flex items-center gap-2">
                <span className="text-gray-2 text-sm font-semibold tracking-[-0.42px]">
                  Liquidation price
                </span>
                <div className="flex-1 flex justify-end">
                  <span className="text-gray-2 text-sm font-normal tracking-[-0.42px]">
                    $
                    {liquidationPrice.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </span>
                </div>
              </CardSection>
            </Card>
          </div>

          {/* Main Section */}
          <div className="flex flex-col gap-[25px] pb-6 pt-2.5 px-6 rounded-b-[10px]">
            {/* Take Profit Section */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1.5">
                <span className="text-white text-xs font-semibold tracking-[-0.24px]">
                  Take profit
                </span>
              </div>

              {/* Option Buttons */}
              <div className="flex gap-2 h-[38px]">
                {TAKE_PROFIT_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleTakeProfitOptionChange(option)}
                    className={`flex-1 flex items-center justify-center h-9 rounded-[10px] text-sm font-normal tracking-[-0.42px] transition-colors cursor-pointer ${
                      localSettings.takeProfit.option === option
                        ? "bg-white text-black"
                        : "bg-white/5 text-gray-2 hover:bg-white/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Input Fields */}
              <div className="flex gap-2 h-11">
                <div className="flex-1 relative bg-white/5 rounded-[10px]">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={localSettings.takeProfit.triggerPrice}
                    onChange={(e) =>
                      handleTakeProfitTriggerPriceChange(e.target.value)
                    }
                    placeholder="Trigger price"
                    className="w-full h-full bg-transparent text-white text-sm font-normal tracking-[-0.42px] pl-4 pr-10 outline-none placeholder:text-gray-2"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-sm font-normal tracking-[-0.42px]">
                    ($)
                  </span>
                </div>
                <div className="flex-1 relative bg-white/5 rounded-[10px]">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={localSettings.takeProfit.percentProfit}
                    onChange={(e) =>
                      handleTakeProfitPercentChange(e.target.value)
                    }
                    placeholder="% Profit"
                    className="w-full h-full bg-transparent text-white text-sm font-normal tracking-[-0.42px] pl-4 pr-8 outline-none placeholder:text-gray-2"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-sm font-normal tracking-[-0.42px]">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Stop Loss Section */}
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center justify-between px-1.5">
                <span className="text-white text-xs font-semibold tracking-[-0.24px]">
                  Stop loss
                </span>
              </div>

              {/* Option Buttons */}
              <div className="flex gap-2 h-[38px]">
                {STOP_LOSS_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleStopLossOptionChange(option)}
                    className={`flex-1 flex items-center justify-center h-9 rounded-[10px] text-sm font-normal tracking-[-0.42px] transition-colors cursor-pointer ${
                      localSettings.stopLoss.option === option
                        ? "bg-white text-black"
                        : "bg-white/5 text-gray-2 hover:bg-white/10"
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>

              {/* Input Fields */}
              <div className="flex gap-2 h-11">
                <div className="flex-1 relative bg-white/5 rounded-[10px]">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={localSettings.stopLoss.triggerPrice}
                    onChange={(e) =>
                      handleStopLossTriggerPriceChange(e.target.value)
                    }
                    placeholder="Trigger price"
                    className="w-full h-full bg-transparent text-white text-sm font-normal tracking-[-0.42px] pl-4 pr-10 outline-none placeholder:text-gray-2"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-sm font-normal tracking-[-0.42px]">
                    ($)
                  </span>
                </div>
                <div className="flex-1 relative bg-white/5 rounded-[10px]">
                  <input
                    type="text"
                    inputMode="decimal"
                    value={localSettings.stopLoss.percentLoss}
                    onChange={(e) =>
                      handleStopLossPercentChange(e.target.value)
                    }
                    placeholder="% Loss"
                    className="w-full h-full bg-transparent text-white text-sm font-normal tracking-[-0.42px] pl-4 pr-8 outline-none placeholder:text-gray-2"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-sm font-normal tracking-[-0.42px]">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Done Button */}
            <Button
              onClick={handleDone}
              className="w-full h-14 bg-white text-black hover:bg-white/90 text-base font-semibold"
            >
              Done
            </Button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// Helper function to format auto close display text
export function formatAutoCloseDisplay(settings: AutoCloseSettings): string {
  const tp =
    settings.takeProfit.option === "Off"
      ? "TP Off"
      : `TP ${settings.takeProfit.option}`;
  const sl =
    settings.stopLoss.option === "Off"
      ? "SL Off"
      : `SL ${settings.stopLoss.option}`;
  return `${tp}, ${sl}`;
}
