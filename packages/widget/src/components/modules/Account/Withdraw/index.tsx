import { Result } from "@effect-atom/atom-react";
import { Navigate } from "@tanstack/react-router";
import {
  Button,
  PercentageSlider,
  Skeleton,
  Text,
} from "@yieldxyz/perps-common/components";
import type { WalletConnected } from "@yieldxyz/perps-common/domain";
import {
  useProviderBalance,
  useWithdrawForm,
  useWithdrawPercentage,
  WithdrawForm,
} from "@yieldxyz/perps-common/hooks";
import { formatAmount, formatTokenAmount } from "@yieldxyz/perps-common/lib";
import type { ApiSchemas } from "@yieldxyz/perps-common/services";
import { BackButton } from "../../../molecules/navigation/back-button";
import { WalletProtectedRoute } from "../../../molecules/navigation/wallet-protected-route";
import { ProviderSelect } from "../../../molecules/provider-select";
import { useProviders, useSelectedProvider } from "./state";

function AccountWithdrawContent({
  wallet,
  selectedProvider,
  providers,
  providerBalance,
  setSelectedProvider,
}: {
  wallet: WalletConnected;
  selectedProvider: ApiSchemas.ProviderDto;
  providers: ReadonlyArray<ApiSchemas.ProviderDto>;
  providerBalance: ApiSchemas.BalanceDto;
  setSelectedProvider: (provider: ApiSchemas.ProviderDto) => void;
}) {
  const { percentage, handlePercentageChange } = useWithdrawPercentage(
    wallet.currentAccount.address,
  );

  return (
    <div className="flex flex-col gap-[15px] items-center w-full">
      <div className="flex flex-col items-start w-full gap-2">
        {/* Provider Selector */}
        <Text as="p" variant="labelXsGray2">
          Select provider
        </Text>
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
          <Text as="p" variant="labelSmGray2Neg" className="text-center">
            Available:{" "}
            {formatTokenAmount({
              amount: providerBalance.availableBalance,
              symbol: providerBalance.collateral.symbol,
            })}
          </Text>
        </div>

        {/* Slider Section */}
        <div className="pt-8 w-full">
          <Text as="p" variant="labelSmGray2Tight">
            Withdraw: {percentage}%
          </Text>

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
          <Text as="p" variant="titleXlTight" className="flex-1">
            Withdraw
          </Text>
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
          onClick={() => submit()}
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
