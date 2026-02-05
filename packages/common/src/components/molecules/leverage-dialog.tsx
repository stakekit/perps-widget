import type { DialogRootActions } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { formatAmount, formatPercentage } from "../../lib/formatting";
import {
  generateLeverageButtons,
  getLeverageFromPercent,
  getLeveragePercent,
  getLeverageStops,
  getLiquidationPrice,
  getPriceChangePercentToLiquidation,
} from "../../lib/math";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Divider } from "../ui/divider";
import { Slider } from "../ui/slider";
import { Text } from "../ui/text";
import { ToggleGroup } from "./toggle-group";

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

  const leverageStops = getLeverageStops(maxLeverage);

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
        <Text
          as="span"
          variant="labelSmWhiteNegNoLeading"
          data-testid="leverage-title"
          className="w-[90px]"
        >
          Leverage
        </Text>
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
        <Text
          as="p"
          variant="amountDisplay44"
          data-testid="leverage-display"
          className="text-center"
        >
          {localLeverage}x
        </Text>
      </div>

      {/* Warning Banner */}
      <div className="flex items-center justify-center h-11 bg-accent-red/30 rounded-[10px] px-4">
        <Text as="p" variant="bodySmWhiteNegNoLeading" className="text-right">
          You will be liquidated if price {side === "long" ? "drops" : "rises"}{" "}
          by {priceDropPercent}
        </Text>
      </div>

      {/* Info Card */}
      <div className="flex flex-col gap-2 pt-2.5">
        <div className="h-2.5" />
        <div className="flex flex-col">
          <div className="bg-white/5 flex items-center justify-between p-4 rounded-t-2xl">
            <Text as="span" variant="labelSmGray2Neg">
              Est. Liquidation Price
            </Text>
            <Text as="span" variant="bodySmNeg" className="text-accent-red">
              {formatAmount(liquidationPrice, {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </Text>
          </div>

          <Divider />

          <div className="bg-white/5 flex items-center justify-between px-4 py-[18px] rounded-b-2xl">
            <Text as="span" variant="labelSmGray2Neg">
              Current price
            </Text>
            <Text as="span" variant="bodySmGray2Neg">
              {formatAmount(currentPrice)}
            </Text>
          </div>
        </div>
      </div>

      {/* Leverage Slider */}
      <div className="flex flex-col gap-4 py-6">
        <Slider
          value={leveragePercent}
          onValueChange={(value) => {
            const v = Array.isArray(value) ? value[0] : value;
            const leverageValue = getLeverageFromPercent({
              percent: v,
              maxLeverage,
            });
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
        size="lg"
        className="w-full text-base font-semibold bg-white text-black hover:bg-white/90 mt-4"
      >
        Set {localLeverage}x
      </Button>
    </div>
  );
}
