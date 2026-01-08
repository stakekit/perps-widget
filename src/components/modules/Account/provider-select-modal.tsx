import { Dialog } from "@base-ui/react/dialog";
import { X } from "lucide-react";

// Provider logos
const hyperliquidLogo =
  "https://assets.coingecko.com/coins/images/38375/standard/hyperliquid.jpg";
const driftLogo =
  "https://assets.coingecko.com/coins/images/28182/standard/drift-logo.png";
const dydxLogo =
  "https://assets.coingecko.com/coins/images/17500/standard/dydx.jpg";
const gmxLogo =
  "https://assets.coingecko.com/coins/images/18323/standard/gmx.png";

export interface Provider {
  id: string;
  name: string;
  logo: string;
  available: boolean;
}

export const providers: Provider[] = [
  {
    id: "hyperliquid",
    name: "Hyperliquid",
    logo: hyperliquidLogo,
    available: true,
  },
  { id: "drift", name: "Drift Protocol", logo: driftLogo, available: false },
  { id: "dydx", name: "DYDX", logo: dydxLogo, available: false },
  { id: "gmx", name: "GMX", logo: gmxLogo, available: false },
];

interface ProviderSelectModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProvider: Provider;
  onSelectProvider: (provider: Provider) => void;
}

export function ProviderSelectModal({
  open,
  onOpenChange,
  selectedProvider,
  onSelectProvider,
}: ProviderSelectModalProps) {
  const handleSelect = (provider: Provider) => {
    if (provider.available) {
      onSelectProvider(provider);
    }
  };

  const handleConfirm = () => {
    onOpenChange(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 animate-in fade-in duration-200" />
        <Dialog.Popup className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-[450px] animate-in fade-in zoom-in-95 duration-200">
          <div className="bg-[#222] flex flex-col gap-2 overflow-hidden pb-5 pt-6 px-6 rounded-2xl">
            {/* Header */}
            <div className="flex items-center justify-between">
              <Dialog.Title className="font-semibold text-sm text-white tracking-[-0.42px]">
                List providers
              </Dialog.Title>
              <Dialog.Close className="p-1 rounded-full hover:bg-gray-5 transition-colors cursor-pointer">
                <X className="size-6 text-gray-2" />
              </Dialog.Close>
            </div>

            {/* Provider List */}
            <div className="flex flex-col gap-[6.5px] items-center pt-2 pb-2.5 w-full">
              {providers.map((provider) => {
                const isSelected = selectedProvider.id === provider.id;
                const isAvailable = provider.available;

                return (
                  <button
                    key={provider.id}
                    type="button"
                    onClick={() => handleSelect(provider)}
                    disabled={!isAvailable}
                    className={`
                      w-full flex items-center gap-[6.5px] p-[13px] rounded-xl transition-colors
                      ${isSelected && isAvailable ? "bg-white/5" : "bg-black/20"}
                      ${isAvailable ? "cursor-pointer hover:bg-white/10" : "cursor-not-allowed opacity-80"}
                    `}
                  >
                    <img
                      src={provider.logo}
                      alt={provider.name}
                      className="size-[26px] rounded-full object-cover"
                    />
                    <div className="flex flex-col items-start gap-1.5">
                      <span className="font-semibold text-sm text-white tracking-[-0.42px]">
                        {provider.name}
                      </span>
                      {!isAvailable && (
                        <span className="font-medium text-[10px] text-gray-2 tracking-[-0.2px] leading-[1.15]">
                          Coming soon
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Select Button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full bg-white text-black font-semibold text-base tracking-[-0.48px] py-6 rounded-2xl hover:bg-gray-100 transition-colors cursor-pointer mt-4"
            >
              Select provider
            </button>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
