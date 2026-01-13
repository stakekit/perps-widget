import { Result } from "@effect-atom/atom-react";
import { Navigate, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import {
  DepositForm,
  useDepositForm,
  useProviders,
  useSelectedProvider,
  useSelectedTokenBalance,
  useTokenAmount,
  useTokenBalances,
} from "@/components/modules/Account/Deposit/state";
import { ProviderSelect } from "@/components/molecules/provider-select";
import { TokenBalanceSelect } from "@/components/molecules/token-balances-select";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type {
  BalanceResponseDto,
  ProviderDto,
} from "@/services/api-client/api-schemas";

function AccountDepositContent({
  selectedTokenBalance,
  selectedProvider,
  tokenBalances,
  providers,
  setSelectedProvider,
  setSelectedTokenBalance,
}: {
  selectedTokenBalance: BalanceResponseDto;
  selectedProvider: ProviderDto;
  tokenBalances: ReadonlyArray<BalanceResponseDto>;
  providers: ReadonlyArray<ProviderDto>;
  setSelectedProvider: (provider: ProviderDto) => void;
  setSelectedTokenBalance: (tokenBalance: BalanceResponseDto) => void;
}) {
  const { tokenAmount } = useTokenAmount();

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
      <div className="flex flex-col gap-[15px] items-center pt-[50px]">
        <div className="flex flex-col items-center gap-2">
          <DepositForm.Initialize defaultValues={{ Amount: "0" }}>
            <DepositForm.Amount />
          </DepositForm.Initialize>
          <p className="text-gray-2 text-sm font-semibold tracking-[-0.42px] text-center">
            {tokenAmount}
          </p>
        </div>

        {/* Token Selector */}
        <TokenBalanceSelect.Root
          tokenBalances={tokenBalances}
          value={selectedTokenBalance}
          onValueChange={setSelectedTokenBalance}
        >
          <TokenBalanceSelect.Trigger />
          <TokenBalanceSelect.Modal>
            <TokenBalanceSelect.List />
          </TokenBalanceSelect.Modal>
        </TokenBalanceSelect.Root>
      </div>
    </div>
  );
}

export function AccountDeposit() {
  const navigate = useNavigate();

  const { providers } = useProviders();
  const { tokenBalances } = useTokenBalances();
  const { selectedTokenBalance, setSelectedTokenBalance } =
    useSelectedTokenBalance();
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
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: ".." })}
          >
            <ArrowLeft className="size-6 text-gray-2" />
          </Button>
          <p className="flex-1 font-semibold text-xl text-foreground tracking-[-0.6px]">
            Deposit
          </p>
        </div>

        {/* Content */}
        {showContent ? (
          <AccountDepositContent
            providers={providers}
            tokenBalances={tokenBalances}
            selectedTokenBalance={selectedTokenBalance}
            selectedProvider={selectedProvider}
            setSelectedProvider={setSelectedProvider}
            setSelectedTokenBalance={setSelectedTokenBalance}
          />
        ) : (
          <div className="flex flex-col gap-[15px] items-center w-full">
            {/* Provider selector skeleton */}
            <div className="flex flex-col items-start w-full gap-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            {/* Amount display skeleton */}
            <div className="flex flex-col gap-[15px] items-center pt-[50px]">
              <div className="flex flex-col items-center gap-2">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-4 w-20" />
              </div>

              {/* Token selector skeleton */}
              <Skeleton className="h-10 w-28 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Deposit Button - Fixed at bottom */}
      <div className="w-full mt-auto pt-6 flex">
        <Button
          className="flex-1"
          onClick={() => submit()}
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
