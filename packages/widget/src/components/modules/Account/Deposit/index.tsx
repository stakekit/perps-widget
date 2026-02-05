import { Result } from "@effect-atom/atom-react";
import { Navigate } from "@tanstack/react-router";
import {
  Button,
  PercentageSlider,
  Skeleton,
  Text,
} from "@yieldxyz/perps-common/components";
import type {
  TokenBalance,
  WalletConnected,
} from "@yieldxyz/perps-common/domain";
import {
  DepositForm,
  useDepositForm,
  useDepositPercentage,
  useSelectedTokenBalance,
  useTokenAmountValue,
  useTokenBalances,
} from "@yieldxyz/perps-common/hooks";
import { formatTokenAmount } from "@yieldxyz/perps-common/lib";
import type { ApiSchemas } from "@yieldxyz/perps-common/services";
import { BackButton } from "../../../molecules/navigation/back-button";
import { WalletProtectedRoute } from "../../../molecules/navigation/wallet-protected-route";
import { ProviderSelect } from "../../../molecules/provider-select";
import { TokenBalanceSelect } from "../../../molecules/token-balances-select";
import { useProviders, useSelectedProvider } from "./state";

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
  selectedProvider: ApiSchemas.ProviderDto;
  providers: ReadonlyArray<ApiSchemas.ProviderDto>;
  setSelectedProvider: (provider: ApiSchemas.ProviderDto) => void;
  setSelectedTokenBalance: (tokenBalance: TokenBalance) => void;
}) {
  const { tokenAmountValue } = useTokenAmountValue(
    wallet.currentAccount.address,
  );

  const { tokenBalances } = useTokenBalances(wallet.currentAccount.address);

  const { percentage, handlePercentageChange } = useDepositPercentage(
    wallet.currentAccount.address,
  );

  return (
    <div className="flex flex-col gap-[15px] items-center w-full">
      <div className="flex flex-col items-start w-full gap-2">
        {/* Protocol Selector */}
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
          <DepositForm.Initialize defaultValues={{ Amount: "0" }}>
            <DepositForm.Amount />
          </DepositForm.Initialize>
          <Text as="p" variant="labelSmGray2Neg" className="text-center">
            {tokenAmountValue}
          </Text>
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

        <Text as="p" variant="labelSmGray2Neg" className="text-center">
          Available:{" "}
          {formatTokenAmount({
            amount: selectedTokenBalance.amount,
            symbol: selectedTokenBalance.token.symbol,
          })}{" "}
        </Text>

        {/* Slider Section */}
        <div className="pt-4 w-full">
          <Text as="p" variant="labelSmGray2Tight">
            Deposit: {percentage}%
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

export function AccountDepositWithWallet({
  wallet,
}: {
  wallet: WalletConnected;
}) {
  const { providers } = useProviders();
  const { tokenBalances } = useTokenBalances(wallet.currentAccount.address);
  const { selectedTokenBalance, handleSelectTokenBalance } =
    useSelectedTokenBalance(wallet.currentAccount.address);
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
          <Text as="p" variant="titleXlTight" className="flex-1">
            Deposit
          </Text>
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

export function AccountDeposit() {
  return (
    <WalletProtectedRoute>
      {(wallet) => <AccountDepositWithWallet wallet={wallet} />}
    </WalletProtectedRoute>
  );
}
