import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, X } from "lucide-react";
import { useState } from "react";
import {
  type Provider,
  ProviderSelectModal,
  providers,
} from "./provider-select-modal";

const usdcLogo = "https://assets.stakek.it/tokens/usdc_160x160.png";
const arbitrumLogo =
  "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg";

interface Token {
  id: string;
  name: string;
  logo: string;
  chainLogo: string;
}

const tokens: Token[] = [
  { id: "usdc", name: "USDC", logo: usdcLogo, chainLogo: arbitrumLogo },
];

export function AccountDeposit() {
  const navigate = useNavigate();
  const [selectedProvider, setSelectedProvider] = useState<Provider>(
    providers[0],
  );
  const [providerModalOpen, setProviderModalOpen] = useState(false);
  const [selectedToken] = useState(tokens[0]);
  const [amount] = useState("€100");
  const [usdcAmount] = useState("115.39 USDC");

  return (
    <div className="flex flex-col gap-28 w-full h-full">
      {/* Main Content Area */}
      <div className="flex flex-col gap-2 w-full flex-1">
        {/* Header */}
        <div className="flex h-8 items-center justify-between">
          <p className="flex-1 font-semibold text-xl text-foreground tracking-[-0.6px]">
            Deposit
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
        <div className="flex flex-col gap-[15px] items-center w-full">
          {/* Protocol Selector */}
          <button
            type="button"
            onClick={() => setProviderModalOpen(true)}
            className="bg-gray-3 flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-5 transition-colors"
          >
            <img
              src={selectedProvider.logo}
              alt={selectedProvider.name}
              className="size-6 rounded-full"
            />
            <span className="text-white font-semibold text-sm tracking-[-0.42px]">
              {selectedProvider.name}
            </span>
            <ChevronDown className="size-4 text-gray-2" />
          </button>

          {/* Provider Select Modal */}
          <ProviderSelectModal
            open={providerModalOpen}
            onOpenChange={setProviderModalOpen}
            selectedProvider={selectedProvider}
            onSelectProvider={setSelectedProvider}
          />

          {/* Amount Display */}
          <div className="flex flex-col gap-[15px] items-center pt-[50px]">
            <div className="flex flex-col items-center">
              <p className="text-white text-[44px] font-semibold tracking-[-1.76px] leading-[96px]">
                {amount}
              </p>
              <p className="text-gray-2 text-sm font-semibold tracking-[-0.42px] text-center">
                {usdcAmount}
              </p>
            </div>

            {/* Token Selector */}
            <button
              type="button"
              className="bg-gray-3 flex items-center gap-2 h-[42px] px-3 py-1.5 rounded-2xl hover:bg-gray-5 transition-colors"
            >
              <div className="relative w-[30px] flex items-end">
                <img
                  src={selectedToken.logo}
                  alt={selectedToken.name}
                  className="size-[26px] rounded-full"
                />
                <img
                  src={selectedToken.chainLogo}
                  alt="Chain"
                  className="size-[13px] rounded-full absolute right-0 bottom-0"
                />
              </div>
              <span className="text-white font-semibold text-base tracking-[-0.48px]">
                {selectedToken.name}
              </span>
              <ChevronDown className="size-3 text-gray-2" />
            </button>
          </div>
        </div>
      </div>

      {/* Deposit Button - Fixed at bottom */}
      <div className="w-full mt-auto pt-6">
        <button
          type="button"
          className="w-full bg-white text-black font-semibold text-base tracking-[-0.48px] py-6 rounded-2xl hover:bg-gray-100 transition-colors"
        >
          Deposit
        </button>
      </div>
    </div>
  );
}
