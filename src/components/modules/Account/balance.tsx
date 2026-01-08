import { Link, useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";

// Protocol logos
const hyperliquidLogo =
  "https://assets.coingecko.com/coins/images/38375/standard/hyperliquid.jpg";
const driftLogo =
  "https://assets.coingecko.com/coins/images/28898/standard/drift-logo.png";
const usdcLogo = "https://assets.stakek.it/tokens/usdc_160x160.png";

interface AccountBalance {
  id: string;
  name: string;
  logo: string;
  cost: string;
  pnl: string;
  pnlAmount: string;
  value: string;
  available: string;
  isPositive: boolean;
}

const accountBalances: AccountBalance[] = [
  {
    id: "hyperliquid",
    name: "HyperLiquid",
    logo: hyperliquidLogo,
    cost: "$200",
    pnl: "+10%",
    pnlAmount: "($0.22)",
    value: "$420",
    available: "$200",
    isPositive: true,
  },
  {
    id: "drift",
    name: "Drift Protocol",
    logo: driftLogo,
    cost: "$515",
    pnl: "+11.11%",
    pnlAmount: "($1.24)",
    value: "$580",
    available: "$0",
    isPositive: true,
  },
];

export function AccountBalances() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-28 h-full w-full">
      {/* Content Area */}
      <div className="flex-1 flex flex-col gap-6 w-full">
        {/* Header */}
        <div className="flex flex-col gap-2 w-full">
          <div className="grid grid-cols-2 h-9 items-center">
            <p className="font-semibold text-xl text-foreground tracking-[-0.6px]">
              Balances
            </p>
            <button
              type="button"
              onClick={() => navigate({ to: ".." })}
              className="justify-self-end p-1 rounded-full hover:bg-gray-5 transition-colors"
            >
              <X className="size-6 text-gray-2" />
            </button>
          </div>

          {/* Account Value Card */}
          <div className="bg-gray-3 rounded-2xl p-4 w-full">
            <div className="flex gap-2 items-center">
              <img src={usdcLogo} alt="USDC" className="size-9" />
              <div className="flex-1 flex flex-col gap-2 justify-center">
                <p className="text-gray-2 font-semibold text-sm leading-tight tracking-[-0.42px]">
                  Account value
                </p>
                <p className="text-foreground text-lg font-semibold leading-tight tracking-[-0.72px]">
                  $1,000.00
                </p>
              </div>
              <div className="flex flex-col gap-2.5 items-end text-accent-green font-semibold text-sm leading-tight tracking-[-0.42px]">
                <p>+10%</p>
                <p>($0.22)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Accounts Balance Section */}
        <div className="flex flex-col gap-2 w-full">
          <p className="font-semibold text-sm text-foreground tracking-[-0.42px] leading-tight">
            Accounts Balance
          </p>

          {accountBalances.map((account) => (
            <div
              key={account.id}
              className="bg-gray-3 rounded-2xl p-4 w-full hover:bg-gray-5 transition-colors"
            >
              <div className="flex gap-2 items-center">
                <img
                  src={account.logo}
                  alt={account.name}
                  className="size-9 rounded-full"
                />
                <div className="flex-1 flex flex-col gap-2.5 justify-center min-w-0">
                  <p className="text-foreground text-lg font-semibold leading-tight tracking-[-0.54px]">
                    {account.name}
                  </p>
                  <div className="flex gap-1.5 items-center">
                    <span className="text-gray-2 font-semibold text-sm tracking-[-0.42px] leading-tight">
                      {account.cost}
                    </span>
                    <span
                      className={`font-semibold text-sm tracking-[-0.42px] leading-tight ${
                        account.isPositive
                          ? "text-accent-green"
                          : "text-accent-red"
                      }`}
                    >
                      {account.pnl} {account.pnlAmount}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col gap-2.5 items-end justify-center">
                  <p className="text-foreground text-lg font-semibold leading-tight tracking-[-0.54px]">
                    {account.value}
                  </p>
                  <p className="text-gray-2 font-semibold text-sm tracking-[-0.42px] leading-tight">
                    Avail: {account.available}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 w-full mt-auto pt-6">
        <Link
          to="/account/withdraw"
          className="flex-1 bg-[#212121] rounded-2xl p-6 flex items-center justify-center hover:bg-[#2a2a2a] transition-colors"
        >
          <span className="font-semibold text-base text-white tracking-[-0.48px]">
            Withdraw
          </span>
        </Link>
        <Link
          to="/account/deposit"
          className="flex-1 bg-white rounded-2xl p-6 flex items-center justify-center hover:bg-gray-100 transition-colors"
        >
          <span className="font-semibold text-base text-black tracking-[-0.48px]">
            Deposit
          </span>
        </Link>
      </div>
    </div>
  );
}
