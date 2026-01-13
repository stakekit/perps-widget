import { ChevronDown } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";
import { TokenIcon } from "@/components/molecules/token-icon";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import {
  cn,
  formatAmount,
  formatNetworkName,
  getTokenString,
} from "@/lib/utils";
import type { BalanceResponseDto } from "@/services/api-client/api-schemas";

// Context for sharing state between components
interface TokenBalanceSelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedTokenBalance: BalanceResponseDto | null;
  setSelectedTokenBalance: (tokenBalance: BalanceResponseDto) => void;
  tokenBalances: ReadonlyArray<BalanceResponseDto>;
  emptyContent: ReactNode;
}

const TokenBalanceSelectContext =
  createContext<TokenBalanceSelectContextValue | null>(null);

function useTokenBalanceSelect() {
  const context = useContext(TokenBalanceSelectContext);
  if (!context) {
    throw new Error(
      "TokenBalanceSelect components must be used within a TokenBalanceSelect.Root",
    );
  }
  return context;
}

// Default empty state component
function DefaultEmptyContent() {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-gray-2">
      <span className="text-md">No tokens available</span>
    </div>
  );
}

// Root component - handles state
interface RootProps {
  children: ReactNode;
  defaultTokenBalance?: BalanceResponseDto;
  value?: BalanceResponseDto;
  onValueChange?: (tokenBalance: BalanceResponseDto) => void;
  tokenBalances: ReadonlyArray<BalanceResponseDto>;
  emptyContent?: ReactNode;
}

function Root({
  children,
  defaultTokenBalance,
  value,
  onValueChange,
  tokenBalances,
  emptyContent = <DefaultEmptyContent />,
}: RootProps) {
  const [open, setOpen] = useState(false);
  const [internalTokenBalance, setInternalTokenBalance] =
    useState<BalanceResponseDto | null>(
      defaultTokenBalance ?? tokenBalances[0] ?? null,
    );

  const selectedTokenBalance = value ?? internalTokenBalance;
  const setSelectedTokenBalance = useCallback(
    (tokenBalance: BalanceResponseDto) => {
      if (!value) {
        setInternalTokenBalance(tokenBalance);
      }
      onValueChange?.(tokenBalance);
    },
    [value, onValueChange],
  );

  const contextValue = {
    open,
    setOpen,
    selectedTokenBalance,
    setSelectedTokenBalance,
    tokenBalances,
    emptyContent,
  };

  return (
    <TokenBalanceSelectContext.Provider value={contextValue}>
      {children}
    </TokenBalanceSelectContext.Provider>
  );
}

// TokenBalance Logo with Chain Badge - reusable component
interface TokenBalanceLogoProps {
  tokenBalance: BalanceResponseDto;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function TokenBalanceLogo({
  tokenBalance,
  size = "md",
  className,
}: TokenBalanceLogoProps) {
  const sizeClasses = {
    sm: {
      container: "w-[24px]",
      tokenBalance: "size-[20px]",
      chain: "size-[10px]",
    },
    md: {
      container: "w-[30px]",
      tokenBalance: "size-[26px]",
      chain: "size-[13px]",
    },
    lg: {
      container: "w-[36px]",
      tokenBalance: "size-[32px]",
      chain: "size-[16px]",
    },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn("relative flex items-end", sizes.container, className)}>
      {tokenBalance.token.logoURI && (
        <TokenIcon
          logoURI={tokenBalance.token.logoURI}
          name={tokenBalance.token.name}
          network={tokenBalance.token.network}
        />
      )}
    </div>
  );
}

// Trigger component - button that opens the modal
interface TriggerProps extends Omit<ComponentProps<"button">, "onClick"> {
  className?: string;
}

function Trigger({ className, children, ...props }: TriggerProps) {
  const { selectedTokenBalance, setOpen } = useTokenBalanceSelect();

  return (
    <button
      type="button"
      onClick={() => setOpen(true)}
      className={cn(
        "bg-gray-3 flex items-center gap-2 h-[42px] px-3 py-1.5 rounded-2xl hover:bg-gray-5 transition-colors",
        className,
      )}
      {...props}
    >
      {children ??
        (selectedTokenBalance ? (
          <>
            <TokenBalanceLogo tokenBalance={selectedTokenBalance} size="md" />
            <span className="text-white font-semibold text-base tracking-[-0.48px]">
              {selectedTokenBalance.token.symbol}
            </span>
            <ChevronDown className="size-3 text-gray-2" />
          </>
        ) : (
          <>
            <span className="text-gray-2 font-semibold text-base tracking-[-0.48px]">
              Select token
            </span>
            <ChevronDown className="size-3 text-gray-2" />
          </>
        ))}
    </button>
  );
}

// Modal component - the dialog wrapper
interface ModalProps {
  children: ReactNode;
  title?: string;
  confirmText?: string;
}

function Modal({
  children,
  title = "Select token",
  confirmText = "Select token",
}: ModalProps) {
  const { open, setOpen } = useTokenBalanceSelect();

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
                {confirmText}
              </Button>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// List component - container for tokenBalance items
interface ListProps extends ComponentProps<"div"> {
  children?: ReactNode;
  tokenBalances?: ReadonlyArray<BalanceResponseDto>;
}

function List({
  className,
  children,
  tokenBalances: tokenBalanceList,
  ...props
}: ListProps) {
  const {
    selectedTokenBalance,
    setSelectedTokenBalance,
    tokenBalances,
    emptyContent,
  } = useTokenBalanceSelect();

  const tokenBalancesToRender = tokenBalanceList ?? tokenBalances;

  // Show empty content when there are no tokens
  if (tokenBalancesToRender.length === 0) {
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

  // If no children provided, render default tokenBalance list
  const content =
    children ??
    tokenBalancesToRender.map((tokenBalance) => (
      <Item
        key={getTokenString(tokenBalance.token)}
        tokenBalance={tokenBalance}
        selected={
          selectedTokenBalance
            ? getTokenString(selectedTokenBalance.token) ===
              getTokenString(tokenBalance.token)
            : false
        }
        onSelect={setSelectedTokenBalance}
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

// Item component - individual tokenBalance item
interface ItemProps extends Omit<ComponentProps<"button">, "onSelect"> {
  tokenBalance: BalanceResponseDto;
  selected?: boolean;
  onSelect?: (tokenBalance: BalanceResponseDto) => void;
}

function Item({
  tokenBalance,
  selected,
  onSelect,
  className,
  ...props
}: ItemProps) {
  const context = useTokenBalanceSelect();

  // Use context values if available and not explicitly provided
  const isSelected =
    selected ??
    (context.selectedTokenBalance
      ? getTokenString(context.selectedTokenBalance.token) ===
        getTokenString(tokenBalance.token)
      : false);

  const handleSelect = onSelect ?? context?.setSelectedTokenBalance;

  const handleClick = () => {
    if (handleSelect) {
      handleSelect(tokenBalance);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-[10px] p-[13px] rounded-xl transition-colors",
        isSelected ? "bg-white/5" : "bg-black/20",
        "cursor-pointer hover:bg-white/10",
        className,
      )}
      {...props}
    >
      <TokenBalanceLogo tokenBalance={tokenBalance} size="md" />
      <div className="flex flex-col items-start gap-0.5 flex-1">
        <span className="font-semibold text-base text-white">
          {tokenBalance.token.symbol}
        </span>
        <span className="font-medium text-[11px] text-gray-2">
          {tokenBalance.token.name} •{" "}
          {formatNetworkName(tokenBalance.token.network)}
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        {tokenBalance.amount && (
          <span className="font-semibold text-base text-white">
            {formatAmount(tokenBalance.amount)}
          </span>
        )}
      </div>
    </button>
  );
}

export const TokenBalanceSelect = {
  Root,
  Trigger,
  Modal,
  List,
  Item,
  TokenBalanceLogo,
};
