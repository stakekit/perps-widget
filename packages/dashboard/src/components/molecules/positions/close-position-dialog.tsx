import type { DialogRootActions } from "@base-ui/react/dialog";
import { Result } from "@effect-atom/atom-react";
import {
  Button,
  Dialog,
  Divider,
  PercentageSlider,
  Text,
} from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import {
  useCloseCalculations,
  useClosePercentage,
  useSubmitClose,
} from "@yieldxyz/perps-common/hooks";
import { formatAmount, formatTokenAmount } from "@yieldxyz/perps-common/lib";
import type { ApiTypes } from "@yieldxyz/perps-common/services";
import { X } from "lucide-react";
import { useRef } from "react";

interface ClosePositionDialogProps {
  position: ApiTypes.PositionDto;
  wallet: WalletConnected;
  children: React.ReactElement;
  onClose?: () => void;
}

export function ClosePositionDialog({
  position,
  wallet,
  children,
  onClose,
}: ClosePositionDialogProps) {
  const actionsRef = useRef<DialogRootActions>({
    close: () => {},
    unmount: () => {},
  });

  const handleClose = () => {
    actionsRef.current.close();
    onClose?.();
  };

  return (
    <Dialog.Root actionsRef={actionsRef}>
      <Dialog.Trigger render={children} />

      <Dialog.Portal>
        <Dialog.Backdrop />

        <Dialog.Popup>
          <ClosePositionDialogContent
            position={position}
            wallet={wallet}
            onClose={handleClose}
          />
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface ClosePositionDialogContentProps {
  position: ApiTypes.PositionDto;
  wallet: WalletConnected;
  onClose: () => void;
}

function ClosePositionDialogContent({
  position,
  wallet,
  onClose,
}: ClosePositionDialogContentProps) {
  const { closePercentage, setClosePercentage } = useClosePercentage();
  const calculations = useCloseCalculations(position);
  const { submitClose, submitResult } = useSubmitClose();

  const isPnlPositive = position.unrealizedPnl >= 0;

  const handleSubmit = () => {
    submitClose({ position, wallet });
  };

  // Close dialog on successful submit (action will be handled by SignTransactionsDialog)
  if (Result.isSuccess(submitResult)) {
    onClose();
  }

  return (
    <div className="flex flex-col gap-2 pb-5 pt-6 px-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Text as="span" variant="labelSmWhiteNegNoLeading">
          Close Position
        </Text>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full cursor-pointer hover:bg-white/5 transition-colors"
        >
          <X className="size-6 text-gray-2" />
        </button>
      </div>

      {/* Amount Display */}
      <div className="flex flex-col items-center gap-2.5 h-[110px] justify-center">
        <Text as="p" variant="labelSmGray2Tight" className="text-center">
          Select amount to close
        </Text>
        <Text as="p" variant="amountDisplay44" className="text-center">
          {formatAmount(calculations.closeValue)}
        </Text>
        <Text as="p" variant="labelSmGray2Tight" className="text-center">
          {formatTokenAmount({
            amount: calculations.closeSize,
            symbol: "Size:",
          })}
        </Text>
      </div>

      {/* Slider */}
      <div className="flex flex-col gap-4 py-6">
        <PercentageSlider
          percentage={closePercentage}
          onPercentageChange={setClosePercentage}
        />
      </div>

      {/* Details Section */}
      <div className="flex flex-col gap-2 pt-2.5">
        <div className="h-2.5" />
        <div className="flex flex-col">
          <div className="bg-white/5 flex items-center justify-between p-4 rounded-t-2xl">
            <Text as="span" variant="labelSmGray2Neg">
              Margin
            </Text>
            <div className="flex items-center gap-2.5">
              <Text as="span" variant="bodySmGray2Neg">
                {formatAmount(calculations.marginReturn)}
              </Text>
              <Text
                as="span"
                variant="bodySmNeg"
                className={
                  isPnlPositive ? "text-accent-green" : "text-accent-red"
                }
              >
                {isPnlPositive ? "+" : ""}
                {formatAmount(calculations.pnlReturn)}
              </Text>
            </div>
          </div>

          <Divider />

          <div className="bg-white/5 flex items-center justify-between px-4 py-[18px] rounded-b-2xl">
            <Text as="span" variant="labelSmGray2Neg">
              You will receive
            </Text>
            <Text as="span" variant="bodySmGray2Neg">
              {formatAmount(calculations.youWillReceive)}
            </Text>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        loading={Result.isWaiting(submitResult)}
        disabled={Result.isWaiting(submitResult) || closePercentage === 0}
        size="lg"
        className="w-full text-base font-semibold bg-white text-black hover:bg-white/90 mt-4"
      >
        {Result.isWaiting(submitResult) ? "Processing..." : "Close position"}
      </Button>
    </div>
  );
}
