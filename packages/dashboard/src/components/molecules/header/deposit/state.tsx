import {
  Atom,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import type { FormReact } from "@lucas-barake/effect-form-react";
import { EvmNetworks } from "@stakekit/common";
import {
  selectedProviderAtom,
  type yieldApiNetworkToMoralisChain,
} from "@yieldxyz/perps-common/atoms";
import { Text } from "@yieldxyz/perps-common/components";
import type {
  TokenBalance,
  WalletAccount,
} from "@yieldxyz/perps-common/domain";
import {
  createDepositForm,
  selectedTokenBalanceAtom,
} from "@yieldxyz/perps-common/hooks";
import {
  calcBaseAmountFromUsd,
  clampPercent,
  formatTokenAmount,
  percentOf,
  round,
  valueFromPercent,
} from "@yieldxyz/perps-common/lib";
import { type ApiTypes, runtimeAtom } from "@yieldxyz/perps-common/services";
import { Effect, Option } from "effect";

// Selected chain atom (network)
type ChainKey = keyof typeof yieldApiNetworkToMoralisChain;

const initialChainAtom = Atom.make<ChainKey>(EvmNetworks.Ethereum);

export const selectedChainAtom = Atom.writable(
  (ctx) => ctx.get(initialChainAtom),
  (_ctx, value: ChainKey) => _ctx.setSelf(value),
);

// Hooks for using atoms in components
export const useProviders = (): {
  selectedProvider: ApiTypes.ProviderDto | null;
  setSelectedProvider: (value: ApiTypes.ProviderDto) => void;
} => {
  const selectedProvider = useAtomValue(selectedProviderAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedProvider = useAtomSet(selectedProviderAtom);

  return {
    selectedProvider,
    setSelectedProvider,
  };
};

export const useSelectedChain = () => {
  const selectedChain = useAtomValue(selectedChainAtom);
  const setSelectedChain = useAtomSet(selectedChainAtom);

  return {
    selectedChain,
    setSelectedChain,
  };
};

// Custom amount field component that matches the Figma design
const DepositAmountField: FormReact.FieldComponent<string> = ({ field }) => {
  const onChange: (typeof field)["onChange"] = (newValue) => {
    const value = newValue.replace(/[^0-9.,]/g, "");
    const parts = value.split(/[.,]/);
    if (parts.length > 2) return;
    field.onChange(value);
  };

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="bg-white/5 rounded-[10px] h-9 flex items-center px-[10px]">
        <input
          inputMode="decimal"
          value={field.value}
          onFocus={() => {
            if (field.value === "0") {
              onChange("");
            }
          }}
          onBlurCapture={() => {
            if (field.value === "" || field.value.startsWith("00")) {
              onChange("0");
            }
          }}
          onChange={(e) => onChange(e.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck="false"
          pattern="^(?!0\d)\d*([.,])?(\d+)?$"
          minLength={1}
          maxLength={79}
          onBlur={field.onBlur}
          placeholder="0.00"
          className="h-10 text-white text-sm font-semibold tracking-[-0.42px] leading-[1.25] bg-transparent border-none outline-none placeholder:text-gray-4 w-full caret-accent-green"
        />
      </div>
      {Option.isSome(field.error) && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-accent-red/10 border border-accent-red/20 animate-in fade-in slide-in-from-top-1 duration-200">
          <div className="size-4 rounded-full bg-accent-red/20 flex items-center justify-center">
            <Text
              as="span"
              variant="inherit"
              className="text-accent-red text-xs font-bold"
            >
              !
            </Text>
          </div>
          <Text
            as="span"
            variant="inherit"
            className="text-accent-red text-sm font-medium"
          >
            {field.error.value}
          </Text>
        </div>
      )}
    </div>
  );
};

export const DepositForm = createDepositForm(DepositAmountField);

const amountAtom = DepositForm.getFieldValue(DepositForm.fields.Amount);
const setAmountFieldAtom = DepositForm.setValue(DepositForm.fields.Amount);

export const useDepositForm = () => {
  const submit = useAtomSet(DepositForm.submit);
  const submitResult = useAtomValue(DepositForm.submit);

  return {
    submit,
    submitResult,
  };
};

export const useDashboardSelectedTokenBalance = (
  walletAddress: WalletAccount["address"],
) => {
  const selectedTokenBalance = useAtomValue(
    selectedTokenBalanceAtom(walletAddress),
  ).pipe(Result.getOrElse(() => null));
  const setSelectedTokenBalance = useAtomSet(
    selectedTokenBalanceAtom(walletAddress),
  );
  const setAmount = useAtomSet(setAmountFieldAtom);

  const handleSelectTokenBalance = (tokenBalance: TokenBalance) => {
    setSelectedTokenBalance(tokenBalance);
    setAmount("0");
  };

  return {
    selectedTokenBalance,
    handleSelectTokenBalance,
  };
};

export const useDashboardDepositPercentage = (
  walletAddress: WalletAccount["address"],
) => {
  const amount = useAtomValue(amountAtom).pipe(
    Option.map(Number),
    Option.filter((v) => !Number.isNaN(v)),
    Option.getOrElse(() => 0),
  );

  const setAmount = useAtomSet(setAmountFieldAtom);

  const { selectedTokenBalance } =
    useDashboardSelectedTokenBalance(walletAddress);
  const availableBalanceUsd = selectedTokenBalance
    ? Number(selectedTokenBalance.amount) * selectedTokenBalance.price
    : 0;

  const percentage = clampPercent(
    percentOf({ part: amount, whole: availableBalanceUsd }),
  );

  const handlePercentageChange = (newPercentage: number) => {
    if (newPercentage >= 100) {
      return setAmount(availableBalanceUsd.toString());
    }

    const newAmount = valueFromPercent({
      total: availableBalanceUsd,
      percent: newPercentage,
    });
    setAmount(round(newAmount).toString());
  };

  return {
    handlePercentageChange,
    percentage: Math.round(percentage),
  };
};

const tokenAmountValueAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    runtimeAtom.atom((ctx) =>
      Effect.gen(function* () {
        const tokenBalance = yield* ctx.result(
          selectedTokenBalanceAtom(walletAddress),
        );

        ctx.subscribe(amountAtom, () => {});

        const amount = ctx.get(amountAtom).pipe(
          Option.map(parseFloat),
          Option.filter((v) => !Number.isNaN(v)),
          Option.getOrElse(() => 0),
        );

        if (!tokenBalance) {
          return "";
        }

        return formatTokenAmount({
          amount: calcBaseAmountFromUsd({
            usdAmount: amount,
            priceUsd: tokenBalance.price,
          }),
          symbol: tokenBalance.token.symbol,
        });
      }),
    ),
);

export const useDashboardTokenAmountValue = (
  walletAddress: WalletAccount["address"],
) => {
  const tokenAmountValue = useAtomValue(
    tokenAmountValueAtom(walletAddress),
  ).pipe(Result.getOrElse(() => null));

  return {
    tokenAmountValue,
  };
};
