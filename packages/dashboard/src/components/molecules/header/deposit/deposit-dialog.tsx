import { Result, useAtomValue } from "@effect-atom/atom-react";
import hyperliquidLogo from "@yieldxyz/perps-common/assets/hyperliquid.png";
import {
  providersAtom,
  yieldApiNetworkToMoralisChain,
} from "@yieldxyz/perps-common/atoms";
import {
  Button,
  Dialog,
  Select,
  Text,
  TokenIcon,
} from "@yieldxyz/perps-common/components";
import type {
  WalletAccount,
  WalletConnected,
} from "@yieldxyz/perps-common/domain";
import {
  formatSnakeCase,
  formatTokenAmount,
  getNetworkLogo,
} from "@yieldxyz/perps-common/lib";
import type { ApiSchemas } from "@yieldxyz/perps-common/services";
import { Array as _Array, Option, Record } from "effect";
import {
  DepositForm,
  useDepositForm,
  useProviders,
  useSelectedChain,
  useSelectedTokenBalance,
  useTokenBalances,
} from "./state";

interface DepositDialogProps {
  wallet: WalletConnected;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DepositDialog({
  wallet,
  open,
  onOpenChange,
}: DepositDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop />
        <Dialog.Popup>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title>Deposit funds</Dialog.Title>
            </Dialog.Header>

            <DepositDialogContent wallet={wallet} />
          </Dialog.Content>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

interface DepositDialogContentProps {
  wallet: WalletConnected;
}

function DepositDialogContent({ wallet }: DepositDialogContentProps) {
  const { submit, submitResult } = useDepositForm();

  const handleSubmit = () => {
    submit({ wallet });
  };

  return (
    <DepositForm.Initialize defaultValues={{ Amount: "0" }}>
      <div className="flex flex-col gap-[35px]">
        <div className="flex flex-col gap-[15px] items-center">
          {/* Provider Select */}
          <ProviderSelect />

          {/* Chain and Token Selects */}
          <div className="flex gap-[15px] w-full">
            <div className="flex-1">
              <ChainSelect walletAddress={wallet.currentAccount.address} />
            </div>
            <div className="flex-1">
              <TokenSelect walletAddress={wallet.currentAccount.address} />
            </div>
          </div>

          {/* Amount Input */}
          <AmountInput walletAddress={wallet.currentAccount.address} />
        </div>

        {/* Deposit Button */}
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={submitResult.waiting}
          loading={submitResult.waiting}
          className="w-full bg-white text-black hover:bg-white/90"
        >
          Deposit
        </Button>
      </div>
    </DepositForm.Initialize>
  );
}

function ProviderSelect() {
  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => [] as ReadonlyArray<ApiSchemas.ProviderDto>),
  );
  const { selectedProvider, setSelectedProvider } = useProviders();

  const items = providers.map((provider) => ({
    value: provider.id,
    label: provider.name,
    provider,
  }));

  return (
    <div className="flex flex-col gap-2 self-stretch">
      <Text as="label" variant="caption11Gray2Medium">
        Select provider
      </Text>
      <Select.Root
        value={selectedProvider?.id}
        onValueChange={(value) => {
          if (!value) return;
          const provider = providers.find((p) => p.id === value);
          if (provider) setSelectedProvider(provider);
        }}
      >
        <Select.Trigger className="w-full">
          <div className="flex items-center gap-2">
            <img
              src={hyperliquidLogo}
              alt={selectedProvider?.name ?? "Provider"}
              className="size-5 rounded-full"
            />
            <Select.Value placeholder="Select provider">
              {selectedProvider?.name ?? "Select provider"}
            </Select.Value>
          </div>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              {items.map((item) => (
                <Select.Item
                  key={item.value}
                  value={item.value}
                  icon={
                    <img
                      src={hyperliquidLogo}
                      alt={item.label}
                      className="size-5 rounded-full"
                    />
                  }
                >
                  {item.label}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

interface ChainSelectProps {
  walletAddress: WalletAccount["address"];
}

function ChainSelect({ walletAddress }: ChainSelectProps) {
  const { selectedChain, setSelectedChain } = useSelectedChain();
  const { handleSelectTokenBalance } = useSelectedTokenBalance(walletAddress);
  const { tokenBalances } = useTokenBalances(walletAddress);

  const chains = Record.keys(yieldApiNetworkToMoralisChain);

  const handleChainChange = (value: string | null) => {
    if (!value) return;
    const chain = value as keyof typeof yieldApiNetworkToMoralisChain;
    setSelectedChain(chain);
    // Select first token of the new chain
    const chainTokens = tokenBalances[chain] ?? [];
    const firstToken = _Array.head(chainTokens);
    if (Option.isSome(firstToken)) {
      handleSelectTokenBalance(firstToken.value);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Text as="label" variant="caption11Gray2Medium">
        Select chain
      </Text>
      <Select.Root value={selectedChain} onValueChange={handleChainChange}>
        <Select.Trigger className="w-full">
          <div className="flex items-center gap-2">
            <TokenIcon
              logoURI={getNetworkLogo(selectedChain)}
              name={formatSnakeCase(selectedChain)}
              size="xs"
            />
            <Select.Value placeholder="Select chain">
              {formatSnakeCase(selectedChain)}
            </Select.Value>
          </div>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup>
              {chains.map((chain) => (
                <Select.Item
                  key={chain}
                  value={chain}
                  showIndicator={false}
                  icon={
                    <TokenIcon
                      logoURI={getNetworkLogo(chain)}
                      name={formatSnakeCase(chain)}
                      size="xs"
                    />
                  }
                >
                  {formatSnakeCase(chain)}
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

interface TokenSelectProps {
  walletAddress: WalletAccount["address"];
}

function TokenSelect({ walletAddress }: TokenSelectProps) {
  const { selectedChain } = useSelectedChain();
  const { selectedTokenBalance, handleSelectTokenBalance } =
    useSelectedTokenBalance(walletAddress);
  const { tokenBalances } = useTokenBalances(walletAddress);

  const chainTokens = tokenBalances[selectedChain] ?? [];

  return (
    <div className="flex flex-col gap-2">
      <Text as="label" variant="caption11Gray2Medium">
        Select token
      </Text>
      <Select.Root
        value={
          selectedTokenBalance
            ? `${selectedTokenBalance.token.network}-${selectedTokenBalance.token.address}`
            : undefined
        }
        onValueChange={(value) => {
          if (!value) return;
          const token = chainTokens.find(
            (t) => `${t.token.network}-${t.token.address}` === value,
          );
          if (token) handleSelectTokenBalance(token);
        }}
      >
        <Select.Trigger className="w-full">
          <div className="flex items-center gap-2">
            {selectedTokenBalance?.token.logoURI && (
              <TokenIcon
                logoURI={selectedTokenBalance.token.logoURI}
                name={selectedTokenBalance.token.symbol}
                size="xs"
              />
            )}
            <Select.Value placeholder="Select token">
              {selectedTokenBalance?.token.symbol ?? "Select token"}
            </Select.Value>
          </div>
        </Select.Trigger>
        <Select.Portal>
          <Select.Positioner>
            <Select.Popup className="min-w-[200px]">
              {chainTokens.map((tokenBalance) => (
                <Select.Item
                  key={`${tokenBalance.token.network}-${tokenBalance.token.address}`}
                  value={`${tokenBalance.token.network}-${tokenBalance.token.address}`}
                  showIndicator={false}
                  icon={
                    tokenBalance.token.logoURI ? (
                      <TokenIcon
                        logoURI={tokenBalance.token.logoURI}
                        name={tokenBalance.token.symbol}
                        size="xs"
                      />
                    ) : undefined
                  }
                >
                  <div className="flex items-center justify-between w-full gap-3">
                    <span>{tokenBalance.token.symbol}</span>
                    <span className="text-gray-2 text-[11px]">
                      {formatTokenAmount({
                        amount: tokenBalance.amount,
                        symbol: tokenBalance.token.symbol,
                      })}
                    </span>
                  </div>
                </Select.Item>
              ))}
            </Select.Popup>
          </Select.Positioner>
        </Select.Portal>
      </Select.Root>
    </div>
  );
}

interface AmountInputProps {
  walletAddress: WalletAccount["address"];
}

function AmountInput({ walletAddress }: AmountInputProps) {
  const { selectedTokenBalance } = useSelectedTokenBalance(walletAddress);

  const availableBalance = selectedTokenBalance
    ? formatTokenAmount({
        amount: selectedTokenBalance.amount,
        symbol: selectedTokenBalance.token.symbol,
      })
    : null;

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="flex items-center justify-between">
        <Text
          as="label"
          variant="inherit"
          className="text-white text-xs font-semibold tracking-[-0.36px]"
        >
          Enter amount
        </Text>
        {availableBalance && (
          <Text
            as="span"
            variant="inherit"
            className="text-gray-2 text-xs font-semibold tracking-[-0.36px]"
          >
            Available: {availableBalance}
          </Text>
        )}
      </div>
      <DepositForm.Amount />
    </div>
  );
}
