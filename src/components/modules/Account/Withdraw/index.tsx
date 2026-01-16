import { Result } from "@effect-atom/atom-react";
import { Navigate } from "@tanstack/react-router";
import {
  useProviderBalance,
  useProviders,
  useSelectedProvider,
  useWithdrawForm,
  useWithdrawPercentage,
  WithdrawForm,
} from "@/components/modules/Account/Withdraw/state";
import { BackButton } from "@/components/molecules/navigation/back-button";
import { WalletProtectedRoute } from "@/components/molecules/navigation/wallet-protected-route";
import { PercentageSlider } from "@/components/molecules/percentage-slider";
import { ProviderSelect } from "@/components/molecules/provider-select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { WalletConnected } from "@/domain/wallet";
import { formatAmount, formatTokenAmount } from "@/lib/utils";
import type {
  BalanceDto,
  ProviderDto,
} from "@/services/api-client/api-schemas";

function AccountWithdrawContent({
  wallet,
  selectedProvider,
  providers,
  providerBalance,
  setSelectedProvider,
}: {
  wallet: WalletConnected;
  selectedProvider: ProviderDto;
  providers: ReadonlyArray<ProviderDto>;
  providerBalance: BalanceDto;
  setSelectedProvider: (provider: ProviderDto) => void;
}) {
  const { percentage, handlePercentageChange } = useWithdrawPercentage(wallet);

  return (
    <div className="flex flex-col gap-[15px] items-center w-full">
      <div className="flex flex-col items-start w-full gap-2">
        {/* Provider Selector */}
        <p className="text-gray-2 text-xs font-semibold tracking-tight">
          Select provider
        </p>
        <ProviderSelect.Root
          providers={providers}
          value={selectedProvider}
          onValueChange={setSelectedProvider}
        >
          <ProviderSelect.Trigger />
          <ProviderSelect.Modal>
            <ProviderSelect.List />
          </ProviderSelect.Modal>
        </ProviderSelect.Root>
      </div>

      {/* Amount Display */}
      <div className="flex flex-col gap-[15px] items-center pt-[50px] w-full">
        <div className="flex flex-col items-center gap-2">
          <WithdrawForm.Initialize
            defaultValues={{
              Amount: formatAmount(providerBalance.availableBalance / 2, {
                symbol: null,
                maximumFractionDigits: 2,
              }),
            }}
          >
            <WithdrawForm.Amount />
          </WithdrawForm.Initialize>
          <p className="text-gray-2 text-sm font-semibold tracking-[-0.42px] text-center">
            Available:{" "}
            {formatTokenAmount({
              amount: providerBalance.availableBalance,
              symbol: providerBalance.collateral.symbol,
            })}
          </p>
        </div>

        {/* Slider Section */}
        <div className="pt-8 w-full">
          <p className="text-gray-2 text-sm font-semibold tracking-tight">
            Withdraw: {percentage}%
          </p>

          <PercentageSlider
            percentage={percentage}
            onPercentageChange={handlePercentageChange}
          />
        </div>
      </div>
    </div>
  );
}

function AccountWithdrawWithWallet({ wallet }: { wallet: WalletConnected }) {
  const { providers } = useProviders();
  const { providerBalance } = useProviderBalance(wallet);
  const { selectedProvider, setSelectedProvider } = useSelectedProvider();
  const { submit, submitResult } = useWithdrawForm();

  const showContent = providers && providerBalance && selectedProvider;

  return (
    <div className="flex flex-col gap-8 w-full h-full">
      <div className="flex flex-col gap-2 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-start gap-2">
          <BackButton />
          <p className="flex-1 font-semibold text-xl text-foreground tracking-[-0.6px]">
            Withdraw
          </p>
        </div>

        {/* Content */}
        {showContent ? (
          <AccountWithdrawContent
            wallet={wallet}
            providers={providers}
            providerBalance={providerBalance}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
          />
        ) : (
          <div className="flex flex-col gap-[15px] items-center w-full">
            {/* Provider selector skeleton */}
            <div className="flex flex-col items-start w-full gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Amount display skeleton */}
            <div className="flex flex-col gap-[15px] items-center pt-[50px] w-full">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Slider skeleton */}
              <div className="pt-8 w-full flex flex-col gap-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-2 w-full rounded-full" />
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                  <Skeleton className="h-10 flex-1 rounded-lg" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Withdraw Button - Fixed at bottom */}
      <div className="w-full mt-auto pt-6 flex">
        <Button
          className="flex-1"
          onClick={() => submit({ wallet })}
          disabled={submitResult.waiting || !showContent}
          loading={submitResult.waiting}
        >
          Withdraw
        </Button>
      </div>

      {Result.isSuccess(submitResult) && (
        <Navigate to="/account/withdraw/sign" />
      )}
    </div>
  );
}

export function AccountWithdraw() {
  return (
    <WalletProtectedRoute>
      {(wallet) => <AccountWithdrawWithWallet wallet={wallet} />}
    </WalletProtectedRoute>
  );
}
