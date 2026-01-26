import type { DialogRootActions } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { ToggleGroup } from "@/components/molecules/toggle-group";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { Divider } from "@/components/ui/divider";
import { Slider } from "@/components/ui/slider";
import {
  getLeveragePercent,
  getLiquidationPrice,
  getPriceChangePercentToLiquidation,
  MIN_LEVERAGE,
} from "@/domain/position";
import { formatAmount, formatPercentage } from "@/lib/utils";

type LeverageDialogProps = Pick<
  LeverageDialogContentProps,
  "leverage" | "onLeverageChange" | "currentPrice" | "maxLeverage" | "side"
> & {
  children: React.ReactElement;
};

export const LeverageDialog = (props: LeverageDialogProps) => {
  const actionsRef = useRef<DialogRootActions>({
    close: () => {},
    unmount: () => {},
  });

  const handleLeverageChange = (leverage: number) => {
    props.onLeverageChange(leverage);
    actionsRef.current.close();
  };

  return (
    <Dialog.Root actionsRef={actionsRef}>
      <Dialog.Trigger render={props.children} />

      <Dialog.Portal>
        <Dialog.Backdrop />

        <Dialog.Popup>
          <LeverageDialogContent
            onLeverageChange={handleLeverageChange}
            onClose={() => actionsRef.current.close()}
            leverage={props.leverage}
            currentPrice={props.currentPrice}
            maxLeverage={props.maxLeverage}
            side={props.side}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

type LeverageDialogContentProps = {
  onClose: () => void;
  leverage: number;
  onLeverageChange: (leverage: number) => void;
  currentPrice: number;
  maxLeverage: number;
  side: "long" | "short";
};

export function LeverageDialogContent({
  onClose,
  leverage,
  onLeverageChange,
  currentPrice,
  maxLeverage,
  side,
}: LeverageDialogContentProps) {
  const [localLeverage, setLocalLeverage] = useState(leverage);

  const leverageStops = [
    MIN_LEVERAGE,
    Math.round(maxLeverage / 2),
    maxLeverage,
  ];

  const leveragePercent = getLeveragePercent({
    leverage: localLeverage,
    maxLeverage,
  });

  const liquidationPrice = getLiquidationPrice({
    currentPrice,
    leverage: localLeverage,
    side,
  });

  const priceDropPercent = formatPercentage(
    getPriceChangePercentToLiquidation({ currentPrice, liquidationPrice }),
  );

  const leverageButtons = generateLeverageButtons(maxLeverage);

  const handleConfirm = () => {
    onLeverageChange(localLeverage);
    onClose();
  };

  return (
    <div className="flex flex-col gap-2 pb-5 pt-6 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span
          data-testid="leverage-title"
          className="font-semibold text-sm text-white tracking-[-0.42px] w-[90px]"
        >
          Leverage
        </span>
        <button
          type="button"
          onClick={() => onClose()}
          className="p-1 rounded-full cursor-pointer hover:bg-white/5 transition-colors"
        >
          <X className="size-6 text-gray-2" />
        </button>
      </div>

      {/* Large Leverage Display */}
      <div className="flex flex-col items-center gap-2.5 h-[110px] justify-center">
        <p
          data-testid="leverage-display"
          className="text-white text-[44px] font-semibold tracking-[-1.76px] leading-none text-center"
        >
          {localLeverage}x
        </p>
      </div>

      {/* Warning Banner */}
      <div className="flex items-center justify-center h-11 bg-accent-red/30 rounded-[10px] px-4">
        <p className="text-white text-sm font-normal tracking-[-0.42px] text-right">
          You will be liquidated if price {side === "long" ? "drops" : "rises"}{" "}
          by {priceDropPercent}
        </p>
      </div>

      {/* Info Card */}
      <div className="flex flex-col gap-2 pt-2.5">
        <div className="h-2.5" />
        <div className="flex flex-col">
          <div className="bg-white/5 flex items-center justify-between p-4 rounded-t-2xl">
            <span className="text-gray-2 text-sm font-semibold tracking-[-0.42px]">
              Est. Liquidation Price
            </span>
            <span className="text-accent-red text-sm font-normal tracking-[-0.42px]">
              {formatAmount(liquidationPrice, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </span>
          </div>

          <Divider />

          <div className="bg-white/5 flex items-center justify-between px-4 py-[18px] rounded-b-2xl">
            <span className="text-gray-2 text-sm font-semibold tracking-[-0.42px]">
              Current price
            </span>
            <span className="text-gray-2 text-sm font-normal tracking-[-0.42px]">
              {formatAmount(currentPrice)}
            </span>
          </div>
        </div>
      </div>

      {/* Leverage Slider */}
      <div className="flex flex-col gap-4 py-6">
        <Slider
          value={leveragePercent}
          onValueChange={(value) => {
            const v = Array.isArray(value) ? value[0] : value;
            const leverageValue = Math.round(
              MIN_LEVERAGE + (v / 100) * (maxLeverage - MIN_LEVERAGE),
            );
            setLocalLeverage(leverageValue);
          }}
          min={0}
          max={100}
          stops={leverageStops}
        />

        {/* Leverage Buttons */}
        <ToggleGroup
          options={leverageButtons.map((stop) => ({
            value: stop.toString(),
            label: `${stop}x`,
          }))}
          value={localLeverage.toString()}
          onValueChange={(value) => setLocalLeverage(Number(value))}
        />
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        className="w-full h-14 bg-white text-black hover:bg-white/90 text-base font-semibold mt-4"
      >
        Set {localLeverage}x
      </Button>
    </div>
  );
}

const generateLeverageButtons = (maxLeverage: number): number[] => {
  const buttons: number[] = [];

  if (maxLeverage >= 2) {
    buttons.push(2);
  }

  if (maxLeverage >= 5) {
    buttons.push(5);
  }

  let value = 10;
  while (value <= maxLeverage) {
    buttons.push(value);
    value *= 2;
  }

  if (buttons[buttons.length - 1] !== maxLeverage && maxLeverage > 2) {
    buttons.push(maxLeverage);
  }

  return [...new Set(buttons)].sort((a, b) => a - b);
};
