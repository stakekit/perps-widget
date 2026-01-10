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

// Token logos
const usdcLogo = "https://assets.stakek.it/tokens/usdc_160x160.png";
const usdtLogo =
  "https://assets.coingecko.com/coins/images/325/standard/Tether.png";
const ethLogo =
  "https://assets.coingecko.com/coins/images/279/standard/ethereum.png";
const wbtcLogo =
  "https://assets.coingecko.com/coins/images/7598/standard/wrapped_bitcoin_wbtc.png";
const daiLogo =
  "https://assets.coingecko.com/coins/images/9956/standard/Badge_Dai.png";

// Chain logos
const arbitrumLogo =
  "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg";
const ethereumChainLogo =
  "https://assets.coingecko.com/coins/images/279/standard/ethereum.png";
const optimismLogo =
  "https://assets.coingecko.com/coins/images/25244/standard/Optimism.png";
const baseLogo =
  "https://assets.coingecko.com/coins/images/32609/standard/base.png";

export interface Token {
  id: string;
  name: string;
  symbol: string;
  logo: string;
  chainLogo: string;
  chainName: string;
  balance?: string;
  available?: boolean;
}

export const tokens: Token[] = [
  {
    id: "usdc-arbitrum",
    name: "USD Coin",
    symbol: "USDC",
    logo: usdcLogo,
    chainLogo: arbitrumLogo,
    chainName: "Arbitrum",
    balance: "1,234.56",
    available: true,
  },
  {
    id: "usdc-ethereum",
    name: "USD Coin",
    symbol: "USDC",
    logo: usdcLogo,
    chainLogo: ethereumChainLogo,
    chainName: "Ethereum",
    balance: "500.00",
    available: true,
  },
  {
    id: "usdt-arbitrum",
    name: "Tether",
    symbol: "USDT",
    logo: usdtLogo,
    chainLogo: arbitrumLogo,
    chainName: "Arbitrum",
    balance: "2,500.00",
    available: true,
  },
  {
    id: "eth-arbitrum",
    name: "Ethereum",
    symbol: "ETH",
    logo: ethLogo,
    chainLogo: arbitrumLogo,
    chainName: "Arbitrum",
    balance: "1.5",
    available: true,
  },
  {
    id: "wbtc-arbitrum",
    name: "Wrapped Bitcoin",
    symbol: "WBTC",
    logo: wbtcLogo,
    chainLogo: arbitrumLogo,
    chainName: "Arbitrum",
    balance: "0.025",
    available: false,
  },
  {
    id: "dai-optimism",
    name: "Dai Stablecoin",
    symbol: "DAI",
    logo: daiLogo,
    chainLogo: optimismLogo,
    chainName: "Optimism",
    balance: "750.00",
    available: false,
  },
  {
    id: "usdc-base",
    name: "USD Coin",
    symbol: "USDC",
    logo: usdcLogo,
    chainLogo: baseLogo,
    chainName: "Base",
    balance: "300.00",
    available: false,
  },
];

// Context for sharing state between components
interface TokenSelectContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  selectedToken: Token;
  setSelectedToken: (token: Token) => void;
}

const TokenSelectContext = createContext<TokenSelectContextValue | null>(null);

function useTokenSelect() {
  const context = useContext(TokenSelectContext);
  if (!context) {
    throw new Error(
      "TokenSelect components must be used within a TokenSelect.Root",
    );
  }
  return context;
}

// Root component - handles state
interface RootProps {
  children: ReactNode;
  defaultToken?: Token;
  value?: Token;
  onValueChange?: (token: Token) => void;
}

function Root({
  children,
  defaultToken = tokens[0],
  value,
  onValueChange,
}: RootProps) {
  const [open, setOpen] = useState(false);
  const [internalToken, setInternalToken] = useState<Token>(defaultToken);

  const selectedToken = value ?? internalToken;
  const setSelectedToken = useCallback(
    (token: Token) => {
      if (!value) {
        setInternalToken(token);
      }
      onValueChange?.(token);
    },
    [value, onValueChange],
  );

  const contextValue = useMemo(
    () => ({
      open,
      setOpen,
      selectedToken,
      setSelectedToken,
    }),
    [open, selectedToken, setSelectedToken],
  );

  return (
    <TokenSelectContext.Provider value={contextValue}>
      {children}
    </TokenSelectContext.Provider>
  );
}

// Token Logo with Chain Badge - reusable component
interface TokenLogoProps {
  token: Token;
  size?: "sm" | "md" | "lg";
  className?: string;
}

function TokenLogo({ token, size = "md", className }: TokenLogoProps) {
  const sizeClasses = {
    sm: { container: "w-[24px]", token: "size-[20px]", chain: "size-[10px]" },
    md: { container: "w-[30px]", token: "size-[26px]", chain: "size-[13px]" },
    lg: { container: "w-[36px]", token: "size-[32px]", chain: "size-[16px]" },
  };

  const sizes = sizeClasses[size];

  return (
    <div className={cn("relative flex items-end", sizes.container, className)}>
      <img
        src={token.logo}
        alt={token.name}
        className={cn(sizes.token, "rounded-full object-cover")}
      />
      <img
        src={token.chainLogo}
        alt={token.chainName}
        className={cn(
          sizes.chain,
          "rounded-full absolute right-0 bottom-0 object-cover",
        )}
      />
    </div>
  );
}

// Trigger component - button that opens the modal
interface TriggerProps extends Omit<ComponentProps<"button">, "onClick"> {
  className?: string;
}

function Trigger({ className, children, ...props }: TriggerProps) {
  const { selectedToken, setOpen } = useTokenSelect();

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
      {children ?? (
        <>
          <TokenLogo token={selectedToken} size="md" />
          <span className="text-white font-semibold text-base tracking-[-0.48px]">
            {selectedToken.symbol}
          </span>
          <ChevronDown className="size-3 text-gray-2" />
        </>
      )}
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
  const { open, setOpen } = useTokenSelect();

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

// List component - container for token items
interface ListProps extends ComponentProps<"div"> {
  children?: ReactNode;
  tokens?: Token[];
}

function List({ className, children, tokens: tokenList, ...props }: ListProps) {
  const { selectedToken, setSelectedToken } = useTokenSelect();

  const tokensToRender = tokenList ?? tokens;

  // If no children provided, render default token list
  const content =
    children ??
    tokensToRender.map((token) => (
      <Item
        key={token.id}
        token={token}
        selected={selectedToken.id === token.id}
        onSelect={setSelectedToken}
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

// Item component - individual token item
interface ItemProps extends Omit<ComponentProps<"button">, "onSelect"> {
  token: Token;
  selected?: boolean;
  onSelect?: (token: Token) => void;
}

function Item({ token, selected, onSelect, className, ...props }: ItemProps) {
  const context = useContext(TokenSelectContext);

  // Use context values if available and not explicitly provided
  const isSelected = selected ?? context?.selectedToken.id === token.id;
  const handleSelect = onSelect ?? context?.setSelectedToken;

  const isAvailable = token.available !== false;

  const handleClick = () => {
    if (isAvailable && handleSelect) {
      handleSelect(token);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!isAvailable}
      className={cn(
        "w-full flex items-center gap-[10px] p-[13px] rounded-xl transition-colors",
        isSelected && isAvailable ? "bg-white/5" : "bg-black/20",
        isAvailable
          ? "cursor-pointer hover:bg-white/10"
          : "cursor-not-allowed opacity-80",
        className,
      )}
      {...props}
    >
      <TokenLogo token={token} size="md" />
      <div className="flex flex-col items-start gap-0.5 flex-1">
        <span className="font-semibold text-sm text-white tracking-[-0.42px]">
          {token.symbol}
        </span>
        <span className="font-medium text-[11px] text-gray-2 tracking-[-0.22px]">
          {token.name} • {token.chainName}
        </span>
      </div>
      <div className="flex flex-col items-end gap-0.5">
        {token.balance && (
          <span className="font-semibold text-sm text-white tracking-[-0.42px]">
            {token.balance}
          </span>
        )}
        {!isAvailable && (
          <span className="font-medium text-[10px] text-gray-2 tracking-[-0.2px]">
            Coming soon
          </span>
        )}
      </div>
    </button>
  );
}

export const TokenSelect = {
  Root,
  Trigger,
  Modal,
  List,
  Item,
  TokenLogo,
};
