import type { DialogRootActions } from "@base-ui/react/dialog";
import { Match } from "effect";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { formatAmount } from "../../lib/formatting";
import {
  calcTpSlPercentFromTriggerPrice,
  calcTpSlTriggerPriceFromPercent,
  DEFAULT_TP_SL_PERCENT_OPTIONS,
  findMatchingPercentOption,
  getTpSlPercentPrefix,
  round,
} from "../../lib/math";
import { Button } from "../ui/button";
import { Card, CardSection } from "../ui/card";
import { Dialog } from "../ui/dialog";
import { Text } from "../ui/text";

type TPOrSLPercentageOption =
  | (typeof DEFAULT_TP_SL_PERCENT_OPTIONS)[number]
  | null;

export type TPOrSLConfiguration = {
  option: TPOrSLPercentageOption;
  triggerPrice: number | null;
  percentage: number | null;
};

export type TPOrSLOption = "takeProfit" | "stopLoss";

export type TPOrSLSettings = Record<TPOrSLOption, TPOrSLConfiguration>;

const defaultEmptyConfiguration: TPOrSLConfiguration = {
  option: null,
  triggerPrice: null,
  percentage: null,
};

type TPOrSLDialogProps = Omit<TPOrSLDialogContentProps, "onClose"> & {
  children: React.ReactElement;
};

export const TPOrSLDialog = (props: TPOrSLDialogProps) => {
  const actionsRef = useRef<DialogRootActions>({
    close: () => {},
    unmount: () => {},
  });

  const handleClose = () => {
    actionsRef.current.close();
  };

  const handleSettingsChange = (settings: TPOrSLSettings) => {
    props.onSettingsChange(settings);
    actionsRef.current.close();
  };

  return (
    <Dialog.Root actionsRef={actionsRef}>
      <Dialog.Trigger render={props.children} />
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <TPOrSLDialogContent
            {...props}
            onClose={handleClose}
            onSettingsChange={handleSettingsChange}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

interface TPOrSLDialogContentProps {
  onClose: () => void;
  settings: TPOrSLSettings;
  onSettingsChange: (settings: TPOrSLSettings) => void;
  entryPrice: number;
  currentPrice: number;
  liquidationPrice: number;
  side?: "long" | "short";
  /** When set, dialog shows only TP or SL section */
  mode?: TPOrSLOption;
  /** When true, shows "Est." prefix for liquidation price */
  isLiquidationPriceEstimate?: boolean;
}

function TPOrSLDialogContent({
  onClose,
  settings,
  onSettingsChange,
  entryPrice,
  currentPrice,
  liquidationPrice,
  side = "long",
  mode,
  isLiquidationPriceEstimate,
}: TPOrSLDialogContentProps) {
  const [localSettings, setLocalSettings] = useState<TPOrSLSettings>(settings);

  const dialogTitle = Match.value(mode).pipe(
    Match.when("takeProfit", () => "Take profit"),
    Match.when("stopLoss", () => "Stop loss"),
    Match.orElse(() => "Take profit and stop loss"),
  );

  const isSingleMode = mode !== undefined;
  const singleModeDescription = Match.value(mode).pipe(
    Match.when("takeProfit", () => "gain"),
    Match.when("stopLoss", () => "loss"),
    Match.orElse(() => "gain or loss"),
  );

  const calculateTriggerPrice = (
    option: TPOrSLPercentageOption,
    tpOrSl: TPOrSLOption,
  ): TPOrSLConfiguration["triggerPrice"] => {
    if (option === null || option === 0) return null;

    return calcTpSlTriggerPriceFromPercent({
      entryPrice,
      percent: option,
      side,
      tpOrSl,
    });
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
        triggerPrice: calculateTriggerPrice(option, tpOrSl),
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

    const percentage = calcTpSlPercentFromTriggerPrice({
      entryPrice,
      triggerPrice,
      side,
      tpOrSl,
    });

    const option = findMatchingPercentOption({
      percent: percentage,
      options: DEFAULT_TP_SL_PERCENT_OPTIONS,
    });

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

    const triggerPrice = calcTpSlTriggerPriceFromPercent({
      entryPrice,
      percent: percentage,
      side,
      tpOrSl,
    });

    const option = findMatchingPercentOption({
      percent: percentage,
      options: DEFAULT_TP_SL_PERCENT_OPTIONS,
    });

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
  };

  return (
    <>
      {/* Top Section */}
      <div className="flex flex-col gap-[25px] pb-5 pt-6 px-6 rounded-t-[15px]">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Text as="span" variant="labelSmWhiteNeg" className="flex-1">
              {dialogTitle}
            </Text>
            <button
              type="button"
              onClick={onClose}
              className="p-1 rounded-full cursor-pointer hover:bg-white/5 transition-colors"
            >
              <X className="size-6 text-gray-2" />
            </button>
          </div>
          <Text as="p" variant="bodySmWhiteNeg">
            {Match.value(isSingleMode).pipe(
              Match.when(
                true,
                () =>
                  `Pick a percentage ${singleModeDescription}, or enter a custom trigger price to automatically close your position.`,
              ),
              Match.orElse(
                () =>
                  "Pick a percentage gain or loss, or enter a custom trigger price to automatically close your position.",
              ),
            )}
          </Text>
        </div>

        {/* Info Card */}
        <Card>
          <InfoRow label="Entry price" value={entryPrice} position="first" />
          <InfoRow
            label="Current price"
            value={currentPrice}
            position="middle"
          />
          <InfoRow
            label={Match.value(isLiquidationPriceEstimate).pipe(
              Match.when(true, () => "Est. liquidation price"),
              Match.orElse(() => "Liquidation price"),
            )}
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
            side={side}
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
            side={side}
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
          size="lg"
          className="w-full text-base font-semibold bg-white text-black hover:bg-white/90"
        >
          Done
        </Button>
      </div>
    </>
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
      <Text as="span" variant="labelSmGray2Neg">
        {label}
      </Text>
      <div className="flex-1 flex justify-end">
        <Text as="span" variant="bodySmGray2Neg">
          {formatAmount(value, { maximumFractionDigits: 0 })}
        </Text>
      </div>
    </CardSection>
  );
}

function TPOrSLSection({
  label,
  percentPlaceholder,
  configuration,
  side,
  onOptionChange,
  onTriggerPriceChange,
  onPercentChange,
  tpOrSl,
}: {
  label: string;
  percentPlaceholder: string;
  configuration: TPOrSLConfiguration;
  side: "long" | "short";
  onOptionChange: (option: TPOrSLPercentageOption) => void;
  onTriggerPriceChange: (value: string) => void;
  onPercentChange: (value: string) => void;
  tpOrSl: TPOrSLOption;
}) {
  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between px-1.5">
        <Text as="span" variant="labelXsWhiteNeg">
          {label}
        </Text>
      </div>

      <OptionButtons
        selectedOption={configuration.option}
        onOptionChange={onOptionChange}
        tpOrSl={tpOrSl}
        side={side}
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
  side,
}: {
  selectedOption: TPOrSLPercentageOption | null;
  onOptionChange: (option: TPOrSLPercentageOption) => void;
  tpOrSl: TPOrSLOption;
  side: "long" | "short";
}) {
  return (
    <div className="flex gap-2 h-[38px]">
      {DEFAULT_TP_SL_PERCENT_OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => onOptionChange(option)}
          className={`flex-1 flex items-center justify-center h-9 rounded-[10px] text-sm font-normal tracking-[-0.42px] transition-colors cursor-pointer ${Match.value(
            selectedOption === option,
          ).pipe(
            Match.when(true, () => "bg-white text-black"),
            Match.orElse(() => "bg-white/5 text-gray-2 hover:bg-white/10"),
          )}`}
        >
          {Match.value(option === 0).pipe(
            Match.when(true, () => "Off"),
            Match.orElse(
              () => `${getTpSlPercentPrefix({ side, tpOrSl })}${option}%`,
            ),
          )}
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
          value={Match.value(triggerPrice).pipe(
            Match.when(null, () => ""),
            Match.orElse((value) => round(value, 2).toString()),
          )}
          onChange={(e) => onTriggerPriceChange(e.target.value)}
          placeholder="Trigger price"
          className="w-full h-full bg-transparent text-white text-sm font-normal tracking-[-0.42px] pl-4 pr-10 outline-none placeholder:text-gray-2"
        />
        <Text
          as="span"
          variant="bodySmWhiteNegNoLeading"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          ($)
        </Text>
      </div>
      <div className="flex-1 relative bg-white/5 rounded-[10px]">
        <input
          type="text"
          inputMode="decimal"
          value={Match.value(percentValue).pipe(
            Match.when(null, () => ""),
            Match.when(0, () => ""),
            Match.orElse((value) => round(value, 2).toString()),
          )}
          onChange={(e) => onPercentChange(e.target.value)}
          placeholder={percentPlaceholder}
          className="w-full h-full bg-transparent text-white text-sm font-normal tracking-[-0.42px] pl-4 pr-8 outline-none placeholder:text-gray-2"
        />
        <Text
          as="span"
          variant="bodySmWhiteNegNoLeading"
          className="absolute right-4 top-1/2 -translate-y-1/2"
        >
          %
        </Text>
      </div>
    </div>
  );
}
