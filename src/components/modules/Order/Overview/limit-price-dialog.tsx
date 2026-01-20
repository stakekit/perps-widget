import type { DialogRootActions } from "@base-ui/react/dialog";
import { X } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";

const PRICE_QUICK_ADJUSTMENTS = [-1, -2, -5, -10];

type LimitPriceDialogProps = Omit<LimitPriceDialogContentProps, "onClose"> & {
  children: React.ReactElement;
};

export const LimitPriceDialog = (props: LimitPriceDialogProps) => {
  const actionsRef = useRef<DialogRootActions>({
    close: () => {},
    unmount: () => {},
  });

  const handleClose = () => {
    actionsRef.current.close();
  };

  const handleLimitPriceChange = (price: number | null) => {
    props.onLimitPriceChange(price);
    actionsRef.current.close();
  };

  return (
    <Dialog.Root actionsRef={actionsRef}>
      <Dialog.Trigger render={props.children} />

      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <LimitPriceDialogContent
            onClose={handleClose}
            onLimitPriceChange={handleLimitPriceChange}
            limitPrice={props.limitPrice}
            currentPrice={props.currentPrice}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

type LimitPriceDialogContentProps = {
  onClose: () => void;
  limitPrice: number | null;
  onLimitPriceChange: (price: number | null) => void;
  currentPrice: number;
};

function LimitPriceDialogContent({
  onClose,
  limitPrice,
  onLimitPriceChange,
  currentPrice,
}: LimitPriceDialogContentProps) {
  const [localPrice, setLocalPrice] = useState<number | null>(
    limitPrice || null,
  );

  const handleQuickAdjust = (percent: number) => {
    const adjustment = currentPrice * (percent / 100);
    const newPrice = currentPrice + adjustment;
    setLocalPrice(newPrice);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const parsedValue = Number.parseFloat(value);

    if (!Number.isNaN(parsedValue)) {
      setLocalPrice(null);
    }
  };

  const handleConfirm = () => {
    onLimitPriceChange(localPrice);
  };

  return (
    <div className="flex flex-col gap-[25px] pb-5 pt-6 px-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-sm text-white tracking-[-0.42px]">
            Set limit price
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full cursor-pointer hover:bg-white/5 transition-colors"
          >
            <X className="size-6 text-gray-2" />
          </button>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-2.5 h-[110px]">
          <p className="font-semibold text-xs text-white tracking-[-0.24px]">
            Set price
          </p>

          {/* Quick Adjustment Buttons */}
          <div className="flex gap-2 h-[38px]">
            {PRICE_QUICK_ADJUSTMENTS.map((percent) => (
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

          {/* Input Field */}
          <div className="flex items-center h-11 bg-white/5 rounded-[10px] overflow-hidden">
            <input
              type="text"
              inputMode="decimal"
              value={localPrice ? localPrice.toFixed(2) : ""}
              onChange={handleInputChange}
              placeholder="Enter value"
              className="flex-1 h-full bg-transparent px-4 text-white text-sm font-normal tracking-[-0.42px] placeholder:text-gray-2 focus:outline-none"
            />
            <span className="pr-4 text-white text-sm font-normal tracking-[-0.42px]">
              USD
            </span>
          </div>
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        className="w-full h-14 bg-white text-black hover:bg-white/90 text-base font-semibold"
      >
        Done
      </Button>
    </div>
  );
}
