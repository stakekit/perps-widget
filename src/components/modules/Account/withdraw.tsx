import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";

const arbitrumLogo =
  "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg";

interface Provider {
  id: string;
  name: string;
  logo: string;
}

const providers: Provider[] = [
  { id: "arbitrum", name: "Arbitrum", logo: arbitrumLogo },
];

const percentageOptions = ["25%", "50%", "75%", "MAX"] as const;

export function AccountWithdraw() {
  const navigate = useNavigate();
  const [selectedProvider] = useState(providers[0]);
  const [amount] = useState("€210");
  const [availableBalance] = useState("420 USDC");
  const [percentage, setPercentage] = useState(50);

  return (
    <div className="flex flex-col gap-28 w-full h-full">
      <div className="flex flex-col gap-12 w-full">
        {/* Header & Amount Section */}
        <div className="flex flex-col w-full">
          <div className="flex flex-col gap-2 w-full">
            {/* Header */}
            <div className="flex h-8 items-center justify-between">
              <p className="flex-1 font-semibold text-xl text-foreground tracking-tight">
                Withdraw
              </p>
              <button
                type="button"
                onClick={() => navigate({ to: ".." })}
                className="p-1 rounded-full hover:bg-gray-5 transition-colors"
              >
                <X className="size-6 text-gray-2" />
              </button>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 items-start pt-4 w-full">
              {/* Provider Selector */}
              <div className="flex flex-col gap-2">
                <p className="text-gray-2 text-xs font-semibold tracking-tight">
                  Select provider
                </p>
                <button
                  type="button"
                  className="bg-gray-5 flex items-center gap-2 px-3 py-1.5 rounded-xl w-full hover:bg-gray-4 transition-colors"
                >
                  <img
                    src={selectedProvider.logo}
                    alt={selectedProvider.name}
                    className="size-6 rounded-full"
                  />
                  <span className="flex-1 text-foreground font-semibold text-sm tracking-tight text-left">
                    {selectedProvider.name}
                  </span>
                  <ChevronDown className="size-4 text-gray-2" />
                </button>
              </div>

              {/* Amount Display */}
              <div className="flex flex-col items-center pt-12 w-full">
                <p className="text-foreground text-[44px] font-semibold tracking-tight leading-tight">
                  {amount}
                </p>
                <p className="text-gray-2 text-sm font-semibold tracking-tight text-center">
                  Available: {availableBalance}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Slider Section */}
        <div className="flex flex-col gap-4">
          {/* Percentage Label */}
          <p className="text-gray-2 text-sm font-semibold tracking-tight">
            Withdraw: {percentage}%
          </p>

          {/* Slider Track */}
          <div className="relative w-full h-2">
            <div className="absolute inset-0 bg-gray-5 rounded-xl" />
            <div
              className="absolute left-0 top-0 h-full bg-gray-4 rounded-xl transition-all"
              style={{ width: `${percentage}%` }}
            />
            <input
              type="range"
              min="0"
              max="100"
              value={percentage}
              onChange={(e) => setPercentage(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>

          {/* Percentage Quick Buttons */}
          <div className="flex gap-2 items-center w-full">
            {percentageOptions.map((option) => {
              const value = option === "MAX" ? 100 : Number.parseInt(option);
              const isActive = percentage === value;
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => setPercentage(value)}
                  className={`flex-1 h-9 rounded-[10px] flex items-center justify-center transition-colors ${
                    isActive
                      ? "bg-gray-4 text-foreground"
                      : "bg-gray-5 text-gray-2 hover:bg-gray-4 hover:text-foreground"
                  }`}
                >
                  <span className="text-sm font-normal tracking-tight">
                    {option}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Withdraw Button - Fixed at bottom */}
      <div className="w-full mt-auto pt-6">
        <button
          type="button"
          className="w-full bg-white text-black font-semibold text-base tracking-[-0.48px] py-6 rounded-2xl hover:bg-gray-100 transition-colors"
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}
