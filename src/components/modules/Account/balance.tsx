import { Result, useAtomValue } from "@effect-atom/atom-react";
import { useNavigate } from "@tanstack/react-router";
import { Option, Record } from "effect";
import hyperliquid from "@/assets/hyperliquid.png";
import { providersBalancesAtom } from "@/atoms/portfolio-atoms";
import { providersAtom } from "@/atoms/providers-atoms";
import { AccountValueDisplay } from "@/components/molecules/account-value-display";
import { BackButton } from "@/components/molecules/navigation/back-button";
import { WalletProtectedRoute } from "@/components/molecules/navigation/wallet-protected-route";
import { Button } from "@/components/ui/button";
import type { WalletConnected } from "@/domain/wallet";
import { formatAmount } from "@/lib/utils";

export function AccountBalancesWithWallet({
  wallet,
}: {
  wallet: WalletConnected;
}) {
  const navigate = useNavigate();

  const providers = useAtomValue(providersAtom);
  const providersBalances = useAtomValue(providersBalancesAtom(wallet));

  const data = Result.all({ providersBalances, providers }).pipe(
    Result.map((val) => ({
      providers: Record.fromIterableBy(val.providers, (p) => p.id),
      balances: val.providersBalances,
    })),
    Result.builder,
  );

  return (
    <div className="flex flex-col gap-8 h-full w-full">
      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col gap-2 w-full">
          <div className="flex items-center justify-start gap-2">
            <BackButton />
            <p className="font-semibold text-xl text-foreground tracking-[-0.6px]">
              Balances
            </p>
          </div>

          {/* Account Value Card */}
          <div className="bg-gray-3 rounded-2xl p-4 w-full">
            <AccountValueDisplay wallet={wallet} />
          </div>
        </div>

        {/* Accounts Balance Section */}
        <div className="flex flex-col gap-2 w-full">
          <p className="font-semibold text-sm text-foreground tracking-[-0.42px] leading-tight">
            Accounts Balance
          </p>

          {data
            .onSuccess((val) =>
              val.balances.map((balance) => {
                const provider = Record.get(
                  val.providers,
                  balance.providerId,
                ).pipe(Option.getOrNull);

                return (
                  <div
                    key={`${balance.providerId}-${balance.collateral.symbol}`}
                    className="bg-gray-3 rounded-2xl p-4 w-full hover:bg-gray-5 transition-colors"
                  >
                    <div className="flex gap-2 items-center">
                      <img
                        // src={provider?.metadata.logoURI}
                        src={hyperliquid}
                        alt={provider?.name}
                        className="size-9 rounded-full"
                      />
                      <div className="flex-1 flex flex-col gap-2.5 justify-center min-w-0">
                        <p className="text-foreground text-md font-semibold leading-tight tracking-[-0.54px]">
                          {provider?.name}
                        </p>
                        {/* <div className="flex gap-1.5 items-center">
                          <span className="text-gray-2 font-semibold text-sm tracking-[-0.42px] leading-tight">
                            {formatPrice(balance.usedMargin)}
                          </span>
                        </div> */}
                      </div>
                      <div className="flex flex-col gap-2.5 items-end justify-center">
                        <p className="text-foreground text-md font-semibold leading-tight tracking-[-0.54px]">
                          {formatAmount(balance.accountValue)}
                        </p>
                        {/* <p className="text-gray-2 font-semibold text-sm tracking-[-0.42px] leading-tight">
                          Avail: {formatPrice(balance.availableBalance)}
                        </p> */}
                      </div>
                    </div>
                  </div>
                );
              }),
            )
            .orElse(() => (
              <div className="bg-gray-3 rounded-2xl p-4 w-full animate-pulse h-20" />
            ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full mt-auto pt-6">
        <Button
          variant="secondary"
          className="flex-1"
          onClick={() => navigate({ to: "/account/withdraw" })}
        >
          Withdraw
        </Button>

        <Button
          className="flex-1"
          onClick={() => navigate({ to: "/account/deposit" })}
        >
          Deposit
        </Button>
      </div>
    </div>
  );
}

export function AccountBalances() {
  return (
    <WalletProtectedRoute>
      {(wallet) => <AccountBalancesWithWallet wallet={wallet} />}
    </WalletProtectedRoute>
  );
}
