import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";
import { ProviderSelect } from "@/components/molecules/provider-select";
import { ToggleGroup } from "@/components/molecules/toggle-group";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const percentageOptions = [
  { value: "25", label: "25%" },
  { value: "50", label: "50%" },
  { value: "75", label: "75%" },
  { value: "100", label: "MAX" },
];

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
            <div className="flex items-center justify-start gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate({ to: ".." })}
              >
                <ArrowLeft className="size-6 text-gray-2" />
              </Button>
              <p className="flex-1 font-semibold text-xl text-foreground tracking-tight">
                Withdraw
              </p>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-4 items-start pt-4 w-full">
              {/* Provider Selector */}
              <div className="flex flex-col gap-2">
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
          <Slider
            value={percentage}
            onValueChange={(value) =>
              setPercentage(Array.isArray(value) ? value[0] : value)
            }
            min={0}
            max={100}
            trackVariant="gray"
            indicatorVariant="gray"
            thumbSize="none"
          />

          {/* Percentage Quick Buttons */}
          <ToggleGroup
            options={percentageOptions}
            value={String(percentage)}
            onValueChange={(v) => setPercentage(Number(v))}
          />
        </div>
      </div>

      {/* Withdraw Button - Fixed at bottom */}
      <div className="w-full mt-auto pt-6 flex">
        <Button className="flex-1">Withdraw</Button>
      </div>
    </div>
  );
}
