import { Result } from "@effect-atom/atom-react";
import { Navigate } from "@tanstack/react-router";
import {
  DepositForm,
  useDepositForm,
  useDepositPercentage,
  useProviders,
  useSelectedProvider,
  useSelectedTokenBalance,
  useTokenAmountValue,
  useTokenBalances,
} from "@/components/modules/Account/Deposit/state";
import { BackButton } from "@/components/molecules/navigation/back-button";
import { WalletProtectedRoute } from "@/components/molecules/navigation/wallet-protected-route";
import { PercentageSlider } from "@/components/molecules/percentage-slider";
import { ProviderSelect } from "@/components/molecules/provider-select";
import { TokenBalanceSelect } from "@/components/molecules/token-balances-select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { TokenBalance } from "@/domain/types";
import type { WalletConnected } from "@/domain/wallet";
import { formatTokenAmount } from "@/lib/utils";
import type { ProviderDto } from "@/services/api-client/api-schemas";

function AccountDepositContent({
  wallet,
  selectedTokenBalance,
  selectedProvider,
  providers,
  setSelectedProvider,
  setSelectedTokenBalance,
}: {
  wallet: WalletConnected;
  selectedTokenBalance: TokenBalance;
  selectedProvider: ProviderDto;
  providers: ReadonlyArray<ProviderDto>;
  setSelectedProvider: (provider: ProviderDto) => void;
  setSelectedTokenBalance: (tokenBalance: TokenBalance) => void;
}) {
  const { tokenAmountValue } = useTokenAmountValue(wallet);

  const { tokenBalances } = useTokenBalances(wallet);

  const { percentage, handlePercentageChange } = useDepositPercentage(wallet);

  return (
    <div className="flex flex-col gap-[15px] items-center w-full">
      <div className="flex flex-col items-start w-full gap-2">
        {/* Protocol Selector */}
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
          <DepositForm.Initialize defaultValues={{ Amount: "0" }}>
            <DepositForm.Amount />
          </DepositForm.Initialize>
          <p className="text-gray-2 text-sm font-semibold tracking-[-0.42px] text-center">
            {tokenAmountValue}
          </p>
        </div>

        {/* Token Selector */}
        <TokenBalanceSelect.Root
          tokenBalances={tokenBalances}
          value={selectedTokenBalance}
          onValueChange={setSelectedTokenBalance}
        >
          <TokenBalanceSelect.Trigger />
          <TokenBalanceSelect.Modal />
        </TokenBalanceSelect.Root>

        <p className="text-gray-2 text-sm font-semibold tracking-[-0.42px] text-center">
          Available:{" "}
          {formatTokenAmount({
            amount: selectedTokenBalance.amount,
            symbol: selectedTokenBalance.token.symbol,
          })}{" "}
        </p>

        {/* Slider Section */}
        <div className="pt-4 w-full">
          <p className="text-gray-2 text-sm font-semibold tracking-tight">
            Deposit: {percentage}%
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

export function AccountDepositWithWallet({
  wallet,
}: {
  wallet: WalletConnected;
}) {
  const { providers } = useProviders();
  const { tokenBalances } = useTokenBalances(wallet);
  const { selectedTokenBalance, handleSelectTokenBalance } =
    useSelectedTokenBalance(wallet);
  const { selectedProvider, setSelectedProvider } = useSelectedProvider();
  const { submit, submitResult } = useDepositForm();

  const showContent =
    providers && tokenBalances && selectedTokenBalance && selectedProvider;

  return (
    <div className="flex flex-col gap-28 w-full h-full">
      {/* Main Content Area */}
      <div className="flex flex-col gap-2 w-full flex-1">
        {/* Header */}
        <div className="flex items-center justify-start gap-2">
          <BackButton />
          <p className="flex-1 font-semibold text-xl text-foreground tracking-[-0.6px]">
            Deposit
          </p>
        </div>

        {/* Content */}
        {showContent ? (
          <AccountDepositContent
            wallet={wallet}
            providers={providers}
            selectedTokenBalance={selectedTokenBalance}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            setSelectedTokenBalance={handleSelectTokenBalance}
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

              {/* Token selector skeleton */}
              <Skeleton className="h-10 w-28 rounded-full" />

              {/* Available balance skeleton */}
              <Skeleton className="h-4 w-32" />

              {/* Slider skeleton */}
              <div className="pt-4 w-full flex flex-col gap-2">
                <Skeleton className="h-5 w-full rounded-full" />
                <div className="flex justify-between">
                  <Skeleton className="h-3 w-6" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-8" />
                  <Skeleton className="h-3 w-10" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Deposit Button - Fixed at bottom */}
      <div className="w-full mt-auto pt-6 flex">
        <Button
          className="flex-1"
          onClick={() => submit({ wallet })}
          disabled={submitResult.waiting}
          loading={submitResult.waiting}
        >
          Deposit
        </Button>
      </div>

      {Result.isSuccess(submitResult) && (
        <Navigate to="/account/deposit/sign" />
      )}
    </div>
  );
}

export function AccountDeposit() {
  return (
    <WalletProtectedRoute>
      {(wallet) => <AccountDepositWithWallet wallet={wallet} />}
    </WalletProtectedRoute>
  );
}
