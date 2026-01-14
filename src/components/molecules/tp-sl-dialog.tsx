import { X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardSection } from "@/components/ui/card";
import { Dialog } from "@/components/ui/dialog";
import { formatAmount } from "@/lib/utils";

const OPTIONS = [0, 10, 25, 50, 100] as const;

type TPOrSLPercentageOption = (typeof OPTIONS)[number] | null;

export type TPOrSLConfiguration = {
  option: TPOrSLPercentageOption;
  triggerPrice: number | null;
  percentage: number | null;
};

export type TPOrSLOption = "takeProfit" | "stopLoss";

export type TPOrSLSettings = Record<TPOrSLOption, TPOrSLConfiguration>;

interface TPOrSLDialogProps {
  onOpenChange: (open: boolean) => void;
  settings: TPOrSLSettings;
  onSettingsChange: (settings: TPOrSLSettings) => void;
  entryPrice: number;
  currentPrice: number;
  liquidationPrice: number;
  /** When set, dialog shows only TP or SL section */
  mode?: TPOrSLOption;
}

const defaultEmptyConfiguration: TPOrSLConfiguration = {
  option: null,
  triggerPrice: null,
  percentage: null,
};

export function TPOrSLDialog({
  onOpenChange,
  settings,
  onSettingsChange,
  entryPrice,
  currentPrice,
  liquidationPrice,
  mode,
}: TPOrSLDialogProps) {
  const [localSettings, setLocalSettings] = useState<TPOrSLSettings>(settings);

  const isSingleMode = mode !== undefined;
  const dialogTitle = isSingleMode
    ? mode === "takeProfit"
      ? "Take profit"
      : "Stop loss"
    : "Take profit and stop loss";

  const calculateTriggerPrice = (
    option: TPOrSLPercentageOption,
  ): TPOrSLConfiguration["triggerPrice"] => {
    if (option === null || option === 0) return null;
    return entryPrice * (1 + option / 100);
  };

  const handleTPOrSLOptionChange = (
    option: TPOrSLPercentageOption,
    tpOrSl: TPOrSLOption,
  ) => {
    setLocalSettings((prev) => ({
      ...prev,
      [tpOrSl]: {
        option,
        percentage: option || null,
        triggerPrice: calculateTriggerPrice(option),
      },
    }));
  };

  const handleTPOrSLTriggerPriceChange = (
    value: string,
    tpOrSl: TPOrSLOption,
  ) => {
    const triggerPrice = Number.parseFloat(value);

    if (Number.isNaN(triggerPrice) || triggerPrice <= 0 || entryPrice <= 0) {
      return setLocalSettings((prev) => ({
        ...prev,
        [tpOrSl]: defaultEmptyConfiguration,
      }));
    }

    const percentage = ((triggerPrice - entryPrice) / entryPrice) * 100;

    const option = findMatchingOption(percentage);

    setLocalSettings((prev) => ({
      ...prev,
      [tpOrSl]: {
        ...prev[tpOrSl],
        triggerPrice,
        option,
        percentage,
      },
    }));
  };

  const handleTPOrSLPercentChange = (value: string, tpOrSl: TPOrSLOption) => {
    const percentage = Number.parseFloat(value);

    if (Number.isNaN(percentage) || percentage <= 0 || entryPrice <= 0) {
      return setLocalSettings((prev) => ({
        ...prev,
        [tpOrSl]: defaultEmptyConfiguration,
      }));
    }

    const triggerPrice = entryPrice * (1 + percentage / 100);

    const option = findMatchingOption(percentage);

    setLocalSettings((prev) => ({
      ...prev,
      [tpOrSl]: {
        ...prev[tpOrSl],
        triggerPrice,
        option,
        percentage,
      },
    }));
  };

  const handleDone = () => {
    onSettingsChange(localSettings);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          {/* Top Section */}
          <div className="flex flex-col gap-[25px] pb-5 pt-6 px-6 rounded-t-[15px]">
            {/* Header */}
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm text-white tracking-[-0.42px] leading-tight flex-1">
                  {dialogTitle}
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
                {isSingleMode
                  ? `Pick a percentage ${mode === "takeProfit" ? "gain" : "loss"}, or enter a custom trigger price to automatically close your position.`
                  : "Pick a percentage gain or loss, or enter a custom trigger price to automatically close your position."}
              </p>
            </div>

            {/* Info Card */}
            <Card>
              <InfoRow
                label="Entry price"
                value={entryPrice}
                position="first"
              />
              <InfoRow
                label="Current price"
                value={currentPrice}
                position="middle"
              />
              <InfoRow
                label="Liquidation price"
                value={liquidationPrice}
                position="last"
              />
            </Card>
          </div>

          {/* Main Section */}
          <div className="flex flex-col gap-[25px] pb-6 pt-2.5 px-6 rounded-b-[10px]">
            {/* Take Profit Section */}
            {(!isSingleMode || mode === "takeProfit") && (
              <TPOrSLSection
                label="Take profit"
                percentPlaceholder="% Profit"
                configuration={localSettings.takeProfit}
                onOptionChange={(option) =>
                  handleTPOrSLOptionChange(option, "takeProfit")
                }
                onTriggerPriceChange={(value) =>
                  handleTPOrSLTriggerPriceChange(value, "takeProfit")
                }
                onPercentChange={(value) =>
                  handleTPOrSLPercentChange(value, "takeProfit")
                }
                tpOrSl="takeProfit"
              />
            )}

            {/* Stop Loss Section */}
            {(!isSingleMode || mode === "stopLoss") && (
              <TPOrSLSection
                label="Stop loss"
                percentPlaceholder="% Loss"
                configuration={localSettings.stopLoss}
                onOptionChange={(option) =>
                  handleTPOrSLOptionChange(option, "stopLoss")
                }
                onTriggerPriceChange={(value) =>
                  handleTPOrSLTriggerPriceChange(value, "stopLoss")
                }
                onPercentChange={(value) =>
                  handleTPOrSLPercentChange(value, "stopLoss")
                }
                tpOrSl="stopLoss"
              />
            )}

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

interface InfoRowProps {
  label: string;
  value: number;
  position: "first" | "middle" | "last";
}

function InfoRow({ label, value, position }: InfoRowProps) {
  return (
    <CardSection position={position} className="flex items-center gap-2">
      <span className="text-gray-2 text-sm font-semibold tracking-[-0.42px]">
        {label}
      </span>
      <div className="flex-1 flex justify-end">
        <span className="text-gray-2 text-sm font-normal tracking-[-0.42px]">
          {formatAmount(value, { maximumFractionDigits: 0 })}
        </span>
      </div>
    </CardSection>
  );
}

function TPOrSLSection({
  label,
  percentPlaceholder,
  configuration,
  onOptionChange,
  onTriggerPriceChange,
  onPercentChange,
  tpOrSl,
}: {
  label: string;
  percentPlaceholder: string;
  configuration: TPOrSLConfiguration;
  onOptionChange: (option: TPOrSLPercentageOption) => void;
  onTriggerPriceChange: (value: string) => void;
  onPercentChange: (value: string) => void;
  tpOrSl: TPOrSLOption;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1.5">
        <span className="text-white text-xs font-semibold tracking-[-0.24px]">
          {label}
        </span>
      </div>

      <OptionButtons
        selectedOption={configuration.option}
        onOptionChange={onOptionChange}
        tpOrSl={tpOrSl}
      />

      <TPOrSLInputFields
        triggerPrice={configuration.triggerPrice}
        percentValue={configuration.percentage}
        percentPlaceholder={percentPlaceholder}
        onTriggerPriceChange={onTriggerPriceChange}
        onPercentChange={onPercentChange}
      />
    </div>
  );
}

function OptionButtons({
  selectedOption,
  onOptionChange,
  tpOrSl,
}: {
  selectedOption: TPOrSLPercentageOption | null;
  onOptionChange: (option: TPOrSLPercentageOption) => void;
  tpOrSl: TPOrSLOption;
}) {
  return (
    <div className="flex gap-2 h-[38px]">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onOptionChange(option)}
          className={`flex-1 flex items-center justify-center h-9 rounded-[10px] text-sm font-normal tracking-[-0.42px] transition-colors cursor-pointer ${
            selectedOption === option
              ? "bg-white text-black"
              : "bg-white/5 text-gray-2 hover:bg-white/10"
          }`}
        >
          {option === 0
            ? "Off"
            : `${tpOrSl === "takeProfit" ? "+" : "-"}${option}%`}
        </button>
      ))}
    </div>
  );
}

function TPOrSLInputFields({
  triggerPrice,
  percentValue,
  percentPlaceholder,
  onTriggerPriceChange,
  onPercentChange,
}: {
  triggerPrice: TPOrSLConfiguration["triggerPrice"];
  percentValue: TPOrSLConfiguration["percentage"];
  percentPlaceholder: string;
  onTriggerPriceChange: (value: string) => void;
  onPercentChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-2 h-11">
      <div className="flex-1 relative bg-white/5 rounded-[10px]">
        <input
          type="text"
          inputMode="decimal"
          value={triggerPrice ? triggerPrice.toFixed(0) : ""}
          onChange={(e) => onTriggerPriceChange(e.target.value)}
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
          value={percentValue ? percentValue.toFixed(0) : ""}
          onChange={(e) => onPercentChange(e.target.value)}
          placeholder={percentPlaceholder}
          className="w-full h-full bg-transparent text-white text-sm font-normal tracking-[-0.42px] pl-4 pr-8 outline-none placeholder:text-gray-2"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white text-sm font-normal tracking-[-0.42px]">
          %
        </span>
      </div>
    </div>
  );
}

const findMatchingOption = (percent: number): TPOrSLPercentageOption | null =>
  OPTIONS.find((opt) => opt !== null && Math.abs(percent - opt) < 0.5) || null;

export const getTPOrSLConfigurationFromPosition = ({
  amount,
  entryPrice,
}: {
  entryPrice: number;
  amount: number | undefined;
}): TPOrSLConfiguration => {
  const percentage = amount ? ((amount - entryPrice) / entryPrice) * 100 : null;
  const option = percentage ? findMatchingOption(percentage) : null;

  return {
    option,
    triggerPrice: amount || null,
    percentage,
  };
};
