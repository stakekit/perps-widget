import { Result, useAtomValue } from "@effect-atom/atom-react";
import hyperliquidLogo from "@yieldxyz/perps-common/assets/hyperliquid.png";
import { providersAtom } from "@yieldxyz/perps-common/atoms";
import {
  Button,
  Dialog,
  PercentageSlider,
  Select,
  Text,
} from "@yieldxyz/perps-common/components";
import type {
  WalletAccount,
  WalletConnected,
} from "@yieldxyz/perps-common/domain";
import { formatTokenAmount, round } from "@yieldxyz/perps-common/lib";
import type { ApiSchemas } from "@yieldxyz/perps-common/services";
import {
  useProviderBalance,
  useProviders,
  useWithdrawForm,
  useWithdrawPercentage,
  WithdrawForm,
} from "./state";

interface WithdrawDialogProps {
  wallet: WalletConnected;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function WithdrawDialog({
  wallet,
  open,
  onOpenChange,
}: WithdrawDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Withdraw funds</Dialog.Title>
            </Dialog.Header>

            <WithdrawDialogContent wallet={wallet} />
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface WithdrawDialogContentProps {
  wallet: WalletConnected;
}

function WithdrawDialogContent({ wallet }: WithdrawDialogContentProps) {
  const { submit, submitResult } = useWithdrawForm();
  const { providerBalance } = useProviderBalance(wallet.currentAccount.address);

  const handleSubmit = () => {
    submit({ wallet });
  };

  const initialAmount = providerBalance
    ? round(providerBalance.availableBalance / 2, 2).toString()
    : "0";

  return (
    <WithdrawForm.Initialize defaultValues={{ Amount: initialAmount }}>
      <div className="flex flex-col gap-[35px]">
        <div className="flex flex-col gap-[15px] items-center">
          {/* Provider Select */}
          <ProviderSelect />

          {/* Amount Input */}
          <AmountInput walletAddress={wallet.currentAccount.address} />

          {/* Percentage Slider */}
          <PercentageSliderSection
            walletAddress={wallet.currentAccount.address}
          />
        </div>

        {/* Withdraw Button */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitResult.waiting || !providerBalance}
          loading={submitResult.waiting}
          className="w-full bg-white text-black hover:bg-white/90"
        >
          Withdraw
        </Button>
      </div>
    </WithdrawForm.Initialize>
  );
}

function ProviderSelect() {
  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => [] as ReadonlyArray<ApiSchemas.ProviderDto>),
  );
  const { selectedProvider, setSelectedProvider } = useProviders();

  const items = providers.map((provider) => ({
    value: provider.id,
    label: provider.name,
    provider,
  }));

  return (
    <div className="flex flex-col gap-2 self-stretch">
      <Text as="label" variant="caption11Gray2Medium">
        Select provider
      </Text>
      <Select.Root
        value={selectedProvider?.id}
        onValueChange={(value) => {
          if (!value) return;
          const provider = providers.find((p) => p.id === value);
          if (provider) setSelectedProvider(provider);
        }}
      >
        <Select.Trigger className="w-full">
          <div className="flex items-center gap-2">
            <img
              src={hyperliquidLogo}
              alt={selectedProvider?.name ?? "Provider"}
              className="size-5 rounded-full"
            />
            <Select.Value placeholder="Select provider">
              {selectedProvider?.name ?? "Select provider"}
            </Select.Value>
          </div>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  value={item.value}
                  icon={
                    <img
                      src={hyperliquidLogo}
                      alt={item.label}
                      className="size-5 rounded-full"
                    />
                  }
                >
                  {item.label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

interface AmountInputProps {
  walletAddress: WalletAccount["address"];
}

function AmountInput({ walletAddress }: AmountInputProps) {
  const { providerBalance } = useProviderBalance(walletAddress);

  const availableBalance = providerBalance
    ? formatTokenAmount({
        amount: providerBalance.availableBalance,
        symbol: providerBalance.collateral.symbol,
      })
    : null;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <Text
          as="label"
          variant="inherit"
          className="text-white text-xs font-semibold tracking-[-0.36px]"
        >
          Enter amount
        </Text>
        {availableBalance && (
          <Text
            as="span"
            variant="inherit"
            className="text-gray-2 text-xs font-semibold tracking-[-0.36px]"
          >
            Available: {availableBalance}
          </Text>
        )}
      </div>
      <WithdrawForm.Amount />
    </div>
  );
}

interface PercentageSliderSectionProps {
  walletAddress: WalletAccount["address"];
}

function PercentageSliderSection({
  walletAddress,
}: PercentageSliderSectionProps) {
  const { percentage, handlePercentageChange } =
    useWithdrawPercentage(walletAddress);

  return (
    <div className="w-full pt-2">
      <Text as="p" variant="caption11Gray2Medium" className="mb-2">
        Withdraw: {percentage}%
      </Text>
      <PercentageSlider
        percentage={percentage}
        onPercentageChange={handlePercentageChange}
      />
    </div>
  );
}
