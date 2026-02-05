import type { DialogRootActions } from "@base-ui/react/dialog";
import { useAtomSet } from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import clsx from "clsx";
import { Option, Schema } from "effect";
import { X } from "lucide-react";
import { useRef } from "react";
import { applyPercentDelta, round } from "../../lib/math";
import { Button } from "../ui/button";
import { Dialog } from "../ui/dialog";
import { Text } from "../ui/text";

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
  const setAmount = useAtomSet(
    LimitPriceForm.setValue(LimitPriceForm.fields.Amount),
  );
  const submit = useAtomSet(LimitPriceForm.submit);

  const handleQuickAdjust = (percent: number) => {
    const newPrice = applyPercentDelta({ value: currentPrice, percent });
    setAmount(round(newPrice, 2).toString());
  };

  const handleConfirm = () =>
    submit({
      onSubmit: (limitPrice) => onLimitPriceChange(limitPrice),
    });

  return (
    <div className="flex flex-col gap-[25px] pb-5 pt-6 px-6">
      {/* Header */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Text as="span" variant="labelSmWhiteNegNoLeading">
            Set limit price
          </Text>
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
          <Text as="p" variant="labelXsWhiteNeg">
            Set price
          </Text>

          {/* Quick Adjustment Buttons */}
          <div className="flex gap-2 h-[38px]">
            <button
              type="button"
              onClick={() => setAmount("")}
              className="flex-1 flex items-center justify-center h-9 bg-white/5 rounded-[10px] text-gray-2 text-sm font-normal tracking-[-0.42px] hover:bg-white/10 transition-colors cursor-pointer"
            >
              Unset
            </button>

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
          <LimitPriceForm.Initialize
            defaultValues={{ Amount: limitPrice?.toString() ?? "" }}
          >
            <LimitPriceForm.Amount />
          </LimitPriceForm.Initialize>
        </div>
      </div>

      {/* Confirm Button */}
      <Button
        onClick={handleConfirm}
        size="lg"
        className="w-full text-base font-semibold bg-white text-black hover:bg-white/90"
      >
        Done
      </Button>
    </div>
  );
}

const limitPriceFormBuilder = FormBuilder.empty.addField(
  "Amount",
  Schema.Union(
    Schema.transform(Schema.Literal(""), Schema.Null, {
      strict: true,
      decode: () => null,
      encode: () => "" as const,
    }),
    Schema.NumberFromString.pipe(
      Schema.annotations({ message: () => "Invalid amount" }),
    ),
  ),
);

const LimitPriceForm = FormReact.make(limitPriceFormBuilder, {
  fields: {
    Amount: ({ field }) => (
      <div
        className={clsx(
          Option.isSome(field.error)
            ? "border-destructive"
            : "border-transparent",
          "flex items-center h-11 bg-white/5 rounded-[10px] overflow-hidden border",
        )}
      >
        <input
          type="text"
          inputMode="decimal"
          value={field.value}
          onChange={(e) => field.onChange(e.target.value)}
          onBlur={field.onBlur}
          placeholder="Enter value"
          className={clsx(
            "flex-1 h-full bg-transparent px-4 text-white text-sm font-normal placeholder:text-gray-2 focus:outline-none",
          )}
        />

        <Text as="span" variant="bodySmWhite" className="pr-4">
          USD
        </Text>
      </div>
    ),
  },
  onSubmit: (
    args: { onSubmit: (limitPrice: number | null) => void },
    { decoded },
  ) => args.onSubmit(decoded.Amount),
});
