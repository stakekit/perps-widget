import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import type { PositionDtoSide } from "@/services/api-client/client-factory";

const MODIFY_OPTIONS = [
  {
    value: "increase",
    label: "Increase Exposure",
    description: "Add more margin to your position",
    icon: ArrowUpRight,
  },
  {
    value: "reduce",
    label: "Reduce Exposure",
    description: "Partially or fully close your position",
    icon: ArrowDownRight,
  },
] as const;

export function ModifyDialog({
  marketId,
  side,
}: {
  marketId: string;
  side: PositionDtoSide;
}) {
  return (
    <Dialog.Root>
      <Dialog.Trigger
        className="flex-1"
        render={(props) => (
          <Button
            {...props}
            className="w-full h-14 text-base font-semibold bg-white text-black hover:bg-white/90"
          >
            Modify
          </Button>
        )}
      />

      <Dialog.Portal>
        <Dialog.Backdrop />

        <Dialog.Popup>
          <Dialog.Content className="pb-5 pt-6 px-6">
            <Dialog.Header>
              <Dialog.Title>Modify Position</Dialog.Title>
            </Dialog.Header>
            <div className="flex flex-col gap-2.5 mt-2">
              {MODIFY_OPTIONS.map((option) => {
                const Icon = option.icon;

                return (
                  <Link
                    key={option.value}
                    params={{ marketId, side }}
                    to={
                      option.value === "increase"
                        ? "/order/$marketId/$side/increase"
                        : "/position-details/$marketId/close"
                    }
                    className="flex items-center gap-3 bg-white/5 px-4 py-4 rounded-[10px] w-full text-left transition-colors hover:bg-white/10 cursor-pointer"
                  >
                    <div className="flex items-center justify-center size-10 rounded-full bg-white/10">
                      <Icon className="size-5 text-white" />
                    </div>
                    <div className="flex flex-col gap-1 flex-1">
                      <span className="text-white font-bold text-base tracking-[-0.48px] leading-tight">
                        {option.label}
                      </span>
                      <span className="text-gray-2 font-normal text-sm tracking-[-0.42px] leading-tight">
                        {option.description}
                      </span>
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
