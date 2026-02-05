import { EvmNetworks } from "@stakekit/common";
import {
  type TokenBalances,
  yieldApiNetworkToMoralisChain,
} from "@yieldxyz/perps-common/atoms";
import {
  Button,
  Dialog,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Text,
  TokenIcon,
  type TokenIconProps,
} from "@yieldxyz/perps-common/components";
import type { TokenBalance } from "@yieldxyz/perps-common/domain";
import {
  cn,
  formatSnakeCase,
  formatTokenAmount,
  getNetworkLogo,
  getTokenString,
} from "@yieldxyz/perps-common/lib";
import { Record } from "effect";
import { ChevronDown } from "lucide-react";
import {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
  useState,
} from "react";

interface TokenBalanceSelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedTokenBalance: TokenBalance | null;
  setSelectedTokenBalance: (tokenBalance: TokenBalance) => void;
  tokenBalances: TokenBalances;
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
      <Text as="span" variant="bodyMd">
        No tokens available
      </Text>
    </div>
  );
}

// Root component - handles state
interface RootProps {
  children: ReactNode;
  defaultTokenBalance?: TokenBalance;
  value?: TokenBalance;
  onValueChange?: (tokenBalance: TokenBalance) => void;
  tokenBalances: TokenBalances;
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
    useState<TokenBalance | null>(
      defaultTokenBalance ?? tokenBalances[EvmNetworks.Ethereum][0] ?? null,
    );

  const selectedTokenBalance = value ?? internalTokenBalance;
  const setSelectedTokenBalance = (tokenBalance: TokenBalance) => {
    if (!value) {
      setInternalTokenBalance(tokenBalance);
    }
    onValueChange?.(tokenBalance);
  };

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
  tokenBalance: TokenBalance;
  size?: TokenIconProps["size"];
  className?: string;
}

function TokenBalanceLogo({
  tokenBalance,
  size = "lg",
  className,
}: TokenBalanceLogoProps) {
  return (
    <div className={cn("relative flex items-end", className)}>
      {tokenBalance.token.logoURI && (
        <TokenIcon
          size={size}
          logoURI={tokenBalance.token.logoURI}
          name={tokenBalance.token.name ?? tokenBalance.token.symbol}
          network={tokenBalance.token.network}
        />
      )}
    </div>
  );
}

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
        "bg-gray-3 flex items-center gap-2 px-3 py-1.5 rounded-2xl hover:bg-gray-5 transition-colors",
        className,
      )}
      {...props}
    >
      {children ??
        (selectedTokenBalance ? (
          <>
            <TokenBalanceLogo tokenBalance={selectedTokenBalance} size="md" />
            <Text as="span" variant="labelBaseSemibold" className="text-white">
              {selectedTokenBalance.token.symbol}
            </Text>
            <ChevronDown className="size-3 text-gray-2" />
          </>
        ) : (
          <>
            <Text as="span" variant="labelBaseSemibold" className="text-gray-2">
              Select token
            </Text>
            <ChevronDown className="size-3 text-gray-2" />
          </>
        ))}
    </button>
  );
}

// Network Tab Trigger with logo + name
interface NetworkTabTriggerProps {
  network: keyof typeof yieldApiNetworkToMoralisChain;
}

function NetworkTabTrigger({ network }: NetworkTabTriggerProps) {
  return (
    <TabsTrigger value={network} className="gap-2 shrink-0">
      <TokenIcon
        logoURI={getNetworkLogo(network)}
        name={formatSnakeCase(network)}
        size="xs"
      />
      <Text as="span" variant="inherit" className="sm:inline">
        {formatSnakeCase(network)}
      </Text>
    </TabsTrigger>
  );
}

// Network Tabs component - renders tabs for each network with token lists
interface NetworkTabsProps {
  defaultNetwork?: (keyof typeof yieldApiNetworkToMoralisChain)[number];
}

function NetworkTabs({
  defaultNetwork = EvmNetworks.Ethereum,
}: NetworkTabsProps) {
  const {
    selectedTokenBalance,
    setSelectedTokenBalance,
    tokenBalances,
    emptyContent,
  } = useTokenBalanceSelect();

  return (
    <Tabs defaultValue={defaultNetwork} className="w-full gap-0">
      <TabsList
        variant="line"
        className="w-full justify-start overflow-x-auto pb-5 gap-1"
      >
        {Record.keys(yieldApiNetworkToMoralisChain).map((network) => (
          <NetworkTabTrigger key={network} network={network} />
        ))}
      </TabsList>

      {Record.keys(yieldApiNetworkToMoralisChain).map((network) => {
        const networkTokens = tokenBalances[network] ?? [];

        return (
          <TabsContent key={network} value={network}>
            {networkTokens.length === 0 ? (
              <div className="flex flex-col gap-[6.5px] items-center pt-2 pb-2.5 w-full">
                {emptyContent}
              </div>
            ) : (
              <div className="flex flex-col gap-[6.5px] items-center pt-2 pb-2.5 w-full max-h-[400px] overflow-y-auto">
                {networkTokens.map((tokenBalance) => (
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
                ))}
              </div>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

// Modal component - the dialog wrapper
interface ModalProps {
  children?: ReactNode;
  title?: string;
  confirmText?: string;
  defaultNetwork?: (keyof typeof yieldApiNetworkToMoralisChain)[number];
}

function Modal({
  children,
  title = "Select token",
  confirmText = "Select token",
  defaultNetwork,
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
          <Dialog.Content className="min-h-[500px]">
            <Dialog.Header>
              <Dialog.Title>{title}</Dialog.Title>
            </Dialog.Header>

            {children ?? <NetworkTabs defaultNetwork={defaultNetwork} />}

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
  tokenBalances?: ReadonlyArray<TokenBalance>;
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

  const tokenBalancesToRender =
    tokenBalanceList ?? tokenBalances[EvmNetworks.Ethereum];

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
        "flex flex-col gap-[6.5px] items-center pt-2 pb-2.5 w-full max-h-[500px] overflow-y-auto",
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
  tokenBalance: TokenBalance;
  selected?: boolean;
  onSelect?: (tokenBalance: TokenBalance) => void;
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
        "w-full flex items-center gap-[10px] py-3 px-2.5 rounded-xl transition-colors",
        isSelected ? "bg-white/5" : "bg-black/20",
        "cursor-pointer hover:bg-white/10",
        className,
      )}
      {...props}
    >
      <TokenBalanceLogo tokenBalance={tokenBalance} size="lg" />
      <div className="flex flex-col items-start gap-0.5 flex-1">
        <Text as="span" variant="labelBaseSemibold" className="text-white">
          {tokenBalance.token.symbol}
        </Text>
        <Text as="span" variant="caption11Gray2Medium">
          {tokenBalance.token.name} •{" "}
          {formatSnakeCase(tokenBalance.token.network)}
        </Text>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        {tokenBalance.amount && (
          <Text as="span" variant="labelSmSemibold" className="text-white">
            {formatTokenAmount({
              amount: tokenBalance.amount,
              symbol: tokenBalance.token.symbol,
            })}
          </Text>
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
  NetworkTabs,
  NetworkTabTrigger,
};
