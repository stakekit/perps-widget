import { ChevronDown } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

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

// Context for sharing state between components
interface ProviderSelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedProvider: Provider;
  setSelectedProvider: (provider: Provider) => void;
}

const ProviderSelectContext = createContext<ProviderSelectContextValue | null>(
  null,
);

function useProviderSelect() {
  const context = useContext(ProviderSelectContext);
  if (!context) {
    throw new Error(
      "ProviderSelect components must be used within a ProviderSelect.Root",
    );
  }
  return context;
}

// Root component - handles state
interface RootProps {
  children: ReactNode;
  defaultProvider?: Provider;
  value?: Provider;
  onValueChange?: (provider: Provider) => void;
}

function Root({
  children,
  defaultProvider = providers[0],
  value,
  onValueChange,
}: RootProps) {
  const [open, setOpen] = useState(false);
  const [internalProvider, setInternalProvider] =
    useState<Provider>(defaultProvider);

  const selectedProvider = value ?? internalProvider;
  const setSelectedProvider = useCallback(
    (provider: Provider) => {
      if (!value) {
        setInternalProvider(provider);
      }
      onValueChange?.(provider);
    },
    [value, onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      selectedProvider,
      setSelectedProvider,
    }),
    [open, selectedProvider, setSelectedProvider],
  );

  return (
    <ProviderSelectContext.Provider value={contextValue}>
      {children}
    </ProviderSelectContext.Provider>
  );
}

// Trigger component - button that opens the modal
interface TriggerProps extends Omit<ComponentProps<"button">, "onClick"> {
  className?: string;
}

function Trigger({ className, children, ...props }: TriggerProps) {
  const { selectedProvider, setOpen } = useProviderSelect();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "bg-gray-3 flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-5 transition-colors",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <img
            src={selectedProvider.logo}
            alt={selectedProvider.name}
            className="size-6 rounded-full"
          />
          <span className="text-white font-semibold text-sm tracking-[-0.42px]">
            {selectedProvider.name}
          </span>
          <ChevronDown className="size-4 text-gray-2" />
        </>
      )}
    </button>
  );
}

// Modal component - the dialog wrapper
interface ModalProps {
  children: ReactNode;
  title?: string;
}

function Modal({ children, title = "List providers" }: ModalProps) {
  const { open, setOpen } = useProviderSelect();

  const handleConfirm = () => {
    setOpen(false);
  };

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>

            {children}

            <Dialog.Footer>
              <Button onClick={handleConfirm} className="flex-1">
                Select provider
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// List component - container for provider items
interface ListProps extends ComponentProps<"div"> {
  children?: ReactNode;
}

function List({ className, children, ...props }: ListProps) {
  const { selectedProvider, setSelectedProvider } = useProviderSelect();

  // If no children provided, render default provider list
  const content =
    children ??
    providers.map((provider) => (
      <Item
        key={provider.id}
        provider={provider}
        selected={selectedProvider.id === provider.id}
        onSelect={setSelectedProvider}
      />
    ));

  return (
    <div
      className={cn(
        "flex flex-col gap-[6.5px] items-center pt-2 pb-2.5 w-full",
        className,
      )}
      {...props}
    >
      {content}
    </div>
  );
}

// Item component - individual provider item
interface ItemProps extends Omit<ComponentProps<"button">, "onSelect"> {
  provider: Provider;
  selected?: boolean;
  onSelect?: (provider: Provider) => void;
}

function Item({
  provider,
  selected,
  onSelect,
  className,
  ...props
}: ItemProps) {
  const context = useContext(ProviderSelectContext);

  // Use context values if available and not explicitly provided
  const isSelected = selected ?? context?.selectedProvider.id === provider.id;
  const handleSelect = onSelect ?? context?.setSelectedProvider;

  const isAvailable = provider.available;

  const handleClick = () => {
    if (isAvailable && handleSelect) {
      handleSelect(provider);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isAvailable}
      className={cn(
        "w-full flex items-center gap-[6.5px] p-[13px] rounded-xl transition-colors",
        isSelected && isAvailable ? "bg-white/5" : "bg-black/20",
        isAvailable
          ? "cursor-pointer hover:bg-white/10"
          : "cursor-not-allowed opacity-80",
        className,
      )}
      {...props}
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
}

export const ProviderSelect = {
  Root,
  Trigger,
  Modal,
  List,
  Item,
};
