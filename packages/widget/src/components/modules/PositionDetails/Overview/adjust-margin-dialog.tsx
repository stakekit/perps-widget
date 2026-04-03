import { Link } from "@tanstack/react-router";
import { Button, Dialog, Text } from "@yieldxyz/perps-common/components";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";

const ADJUST_MARGIN_OPTIONS = [
  {
    value: "add",
    label: "Add Margin",
    description: "Increase margin to reduce liquidation risk",
    icon: ArrowUpRight,
  },
  {
    value: "remove",
    label: "Remove Margin",
    description: "Withdraw excess margin from position",
    icon: ArrowDownRight,
  },
] as const;

export function AdjustMarginDialog({ marketId }: { marketId: string }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="flex-1"
        render={(props) => (
          <Button
            {...props}
            size="default"
            variant="secondary"
            className="w-full"
          >
            Adjust Margin
          </Button>
        )}
      />

      <Dialog.Portal>
        <Dialog.Backdrop />

        <Dialog.Popup>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Adjust Margin</Dialog.Title>
            </Dialog.Header>
            <div className="flex flex-col gap-2.5 mt-2">
              {ADJUST_MARGIN_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                  <Link
                    key={option.value}
                    params={{ marketId }}
                    search={{ mode: option.value }}
                    to="/position-details/$marketId/adjust-margin"
                    className="flex items-center gap-3 bg-white/5 px-4 py-4 rounded-[10px] w-full text-left transition-colors hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex items-center justify-center size-10 rounded-full bg-white/10">
                      <Icon className="size-5 text-white" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <Text as="span" variant="optionTitle">
                        {option.label}
                      </Text>
                      <Text as="span" variant="bodySmGray2NegTight">
                        {option.description}
                      </Text>
                    </div>
                  </Link>
                );
              })}
            </div>
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
