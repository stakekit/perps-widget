import { Check } from "lucide-react";
import type { OrderType } from "@/components/modules/Order/Overview/state";
import { Dialog } from "@/components/ui/dialog";

interface OrderTypeDialogProps {
  onOpenChange: (open: boolean) => void;
  selectedType: OrderType;
  onTypeSelect: (type: OrderType) => void;
}

export const ORDER_TYPE_OPTIONS: {
  value: OrderType;
  label: string;
  description: string;
}[] = [
  {
    value: "market",
    label: "Market",
    description: "Execute immediately at current market price",
  },
  {
    value: "limit",
    label: "Limit",
    description: "Execute only at your specified price or better",
  },
];

export function OrderTypeDialog({
  onOpenChange,
  selectedType,
  onTypeSelect,
}: OrderTypeDialogProps) {
  const handleSelect = (type: OrderType) => {
    onTypeSelect(type);
    onOpenChange(false);
  };

  return (
    <Dialog.Root open onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Content className="pb-5 pt-6 px-6">
            <Dialog.Header>
              <Dialog.Title>Order type</Dialog.Title>
            </Dialog.Header>
            <div className="flex flex-col gap-2.5 mt-2">
              {ORDER_TYPE_OPTIONS.map((option) => {
                const isSelected = selectedType === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className="flex items-center gap-2 bg-white/5 px-4 py-4 rounded-[10px] w-full text-left transition-colors hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex flex-col gap-2 flex-1">
                      <span className="text-white font-bold text-base tracking-[-0.48px] leading-tight">
                        {option.label}
                      </span>
                      <span className="text-gray-2 font-normal text-sm tracking-[-0.42px] leading-tight">
                        {option.description}
                      </span>
                    </div>
                    {isSelected && (
                      <Check className="w-3.5 h-3.5 text-white shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
