import { Result, useAtomValue } from "@effect-atom/atom-react";
import { ChevronDown } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import hyperliquidLogo from "@/assets/hyperliquid.png";
import { providersAtom } from "@/atoms/providers-atoms";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import type { ProviderDto } from "@/services/api-client/api-schemas";

// Context for sharing state between components
interface ProviderSelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedProvider: ProviderDto | null;
  setSelectedProvider: (provider: ProviderDto) => void;
  providers: ReadonlyArray<ProviderDto>;
  emptyContent: ReactNode;
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

// Default empty state component
function DefaultEmptyContent() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-2">
      <span className="text-md">No providers available</span>
    </div>
  );
}

// Root component - handles state
interface RootProps {
  children: ReactNode;
  defaultProvider?: ProviderDto;
  value?: ProviderDto;
  onValueChange?: (provider: ProviderDto) => void;
  providers: ReadonlyArray<ProviderDto>;
  emptyContent?: ReactNode;
}

function Root({
  children,
  defaultProvider,
  value,
  providers,
  onValueChange,
  emptyContent = <DefaultEmptyContent />,
}: RootProps) {
  const [open, setOpen] = useState(false);
  const [internalProvider, setInternalProvider] = useState<ProviderDto | null>(
    defaultProvider ?? providers[0] ?? null,
  );

  const selectedProvider = value ?? internalProvider;
  const setSelectedProvider = useCallback(
    (provider: ProviderDto) => {
      if (!value) {
        setInternalProvider(provider);
      }
      onValueChange?.(provider);
    },
    [value, onValueChange],
  );

  const contextValue = {
    open,
    setOpen,
    selectedProvider,
    setSelectedProvider,
    providers,
    emptyContent,
  };

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
      {children ??
        (selectedProvider ? (
          <>
            <img
              src={hyperliquidLogo}
              alt={selectedProvider.name}
              className="size-6 rounded-full"
            />
            <span className="text-white font-semibold text-sm tracking-[-0.42px]">
              {selectedProvider.name}
            </span>
            <ChevronDown className="size-4 text-gray-2" />
          </>
        ) : (
          <>
            <span className="text-gray-2 font-semibold text-sm tracking-[-0.42px]">
              Select provider
            </span>
            <ChevronDown className="size-4 text-gray-2" />
          </>
        ))}
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
  const { selectedProvider, setSelectedProvider, emptyContent } =
    useProviderSelect();

  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => []),
  );

  // Show empty content when there are no providers
  if (providers.length === 0) {
    return (
      <div
        className={cn(
          "flex flex-col gap-[6.5px] items-center pt-2 pb-2.5 w-full",
          className,
        )}
        {...props}
      >
        {emptyContent}
      </div>
    );
  }

  // If no children provided, render default provider list
  const content =
    children ??
    providers.map((provider) => (
      <Item
        key={provider.id}
        provider={provider}
        selected={
          selectedProvider ? selectedProvider.id === provider.id : false
        }
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
  provider: ProviderDto;
  selected?: boolean;
  onSelect?: (provider: ProviderDto) => void;
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
  const isSelected =
    selected ??
    (context?.selectedProvider
      ? context.selectedProvider.id === provider.id
      : false);
  const handleSelect = onSelect ?? context?.setSelectedProvider;

  const handleClick = () => {
    if (handleSelect) {
      handleSelect(provider);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-[6.5px] p-[13px] rounded-xl transition-colors",
        isSelected ? "bg-white/5" : "bg-black/20",
        "cursor-pointer hover:bg-white/10",
        className,
      )}
      {...props}
    >
      <img
        src={hyperliquidLogo}
        alt={provider.name}
        className="size-[26px] rounded-full object-cover"
      />
      <div className="flex flex-col items-start gap-1.5">
        <span className="font-semibold text-sm text-white tracking-[-0.42px]">
          {provider.name}
        </span>
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
