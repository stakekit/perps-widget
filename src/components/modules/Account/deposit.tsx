import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";
import { ProviderSelect } from "@/components/molecules/provider-select";
import { TokenSelect, tokens } from "@/components/molecules/token-select";
import { Button } from "@/components/ui/button";

export function AccountDeposit() {
  const navigate = useNavigate();
  const [amount] = useState("€100");
  const [usdcAmount] = useState("115.39 USDC");

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
        <div className="flex flex-col gap-[15px] items-center w-full">
          <div className="flex flex-col items-start w-full gap-2">
            {/* Protocol Selector */}
            <p className="text-gray-2 text-xs font-semibold tracking-tight">
              Select provider
            </p>
            <ProviderSelect.Root>
              <ProviderSelect.Trigger />
              <ProviderSelect.Modal>
                <ProviderSelect.List />
              </ProviderSelect.Modal>
            </ProviderSelect.Root>
          </div>

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
            <TokenSelect.Root defaultToken={tokens[0]}>
              <TokenSelect.Trigger />
              <TokenSelect.Modal>
                <TokenSelect.List />
              </TokenSelect.Modal>
            </TokenSelect.Root>
          </div>
        </div>
      </div>

      {/* Deposit Button - Fixed at bottom */}
      <div className="w-full mt-auto pt-6 flex">
        <Button className="flex-1">Deposit</Button>
      </div>
    </div>
  );
}
