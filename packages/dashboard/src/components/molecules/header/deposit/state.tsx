import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import {
  actionAtom,
  moralisTokenBalancesAtom,
  selectedProviderAtom,
  type TokenBalances,
  walletAtom,
  type yieldApiNetworkToMoralisChain,
} from "@yieldxyz/perps-common/atoms";
import { Text } from "@yieldxyz/perps-common/components";
import {
  isArbUsdcToken,
  isEthNativeToken,
  isWalletConnected,
  makeToken,
  type TokenBalance,
  type WalletAccount,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import {
  calcBaseAmountFromUsd,
  clampPercent,
  formatTokenAmount,
  percentOf,
  round,
  valueFromPercent,
} from "@yieldxyz/perps-common/lib";
import {
  ApiClientService,
  type ApiTypes,
  runtimeAtom,
} from "@yieldxyz/perps-common/services";
import {
  Array as _Array,
  Effect,
  Option,
  Predicate,
  Record,
  Schema,
} from "effect";

// Selected chain atom (network)
type ChainKey = keyof typeof yieldApiNetworkToMoralisChain;

const initialChainAtom = Atom.make<ChainKey>("ethereum");

export const selectedChainAtom = Atom.writable(
  (ctx) => ctx.get(initialChainAtom),
  (_ctx, value: ChainKey) => _ctx.setSelf(value),
);

// Selected token balance atom based on wallet address
const selectedTokenBalanceAtom = Atom.family(
  (walletAddress: WalletAccount["address"]) =>
    Atom.writable(
      (ctx) =>
        ctx.get(moralisTokenBalancesAtom(walletAddress)).pipe(
          Result.map((res) => _Array.head(res.ethereum)),
          Result.map(Option.getOrNull),
        ),
      (ctx, value: TokenBalance) => ctx.setSelf(Result.success(value)),
    ),
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

export const useTokenBalances = (walletAddress: WalletAccount["address"]) => {
  const tokenBalances = useAtomValue(
    moralisTokenBalancesAtom(walletAddress),
  ).pipe(Result.getOrElse(() => Record.empty() as TokenBalances));

  return {
    tokenBalances,
  };
};

export const useSelectedTokenBalance = (
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

// Form builder for deposit
export const depositFormBuilder = FormBuilder.empty
  .addField(
    "Amount",
    Schema.NumberFromString.pipe(
      Schema.annotations({ message: () => "Invalid amount" }),
      Schema.greaterThan(0, { message: () => "Must be greater than 0" }),
    ),
  )
  .refineEffect((values) =>
    Effect.gen(function* () {
      const registry = yield* Registry.AtomRegistry;
      const wallet = registry
        .get(walletAtom)
        .pipe(Result.getOrElse(() => null));

      if (!isWalletConnected(wallet)) {
        yield* Effect.logWarning("No wallet found");
        return;
      }

      const tokenBalance = registry
        .get(selectedTokenBalanceAtom(wallet.currentAccount.address))
        .pipe(Result.getOrElse(() => null));

      if (!tokenBalance) {
        return { path: ["Amount"], message: "Missing token balance" };
      }

      const cryptoAmount = calcBaseAmountFromUsd({
        usdAmount: values.Amount,
        priceUsd: tokenBalance.price,
      });

      const usdMin = isArbUsdcToken(makeToken(tokenBalance.token)) ? 5 : 10;

      if (values.Amount < usdMin) {
        return { path: ["Amount"], message: `Minimum deposit is $${usdMin}` };
      }

      if (Number(tokenBalance.amount) < cryptoAmount) {
        return { path: ["Amount"], message: "Insufficient balance" };
      }
    }),
  );

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

export const DepositForm = FormReact.make(depositFormBuilder, {
  runtime: runtimeAtom,
  fields: { Amount: DepositAmountField },
  onSubmit: ({ wallet }: { wallet: WalletConnected }, { decoded }) =>
    Effect.gen(function* () {
      const client = yield* ApiClientService;
      const registry = yield* Registry.AtomRegistry;

      const selectedTokenBalance = registry
        .get(selectedTokenBalanceAtom(wallet.currentAccount.address))
        .pipe(Result.getOrElse(() => null));

      if (!selectedTokenBalance) {
        return yield* Effect.dieMessage("No selected token balance");
      }

      const selectedProvider = registry
        .get(selectedProviderAtom)
        .pipe(Result.getOrElse(() => null));

      if (!selectedProvider) {
        return yield* Effect.dieMessage("No selected provider");
      }

      const cryptoAmount = calcBaseAmountFromUsd({
        usdAmount: decoded.Amount,
        priceUsd: selectedTokenBalance.price,
      });

      const action = yield* client.ActionsControllerExecuteAction({
        providerId: selectedProvider.id,
        address: wallet.currentAccount.address,
        action: "fund",
        args: {
          amount: cryptoAmount.toString(),
          fromToken: {
            network: selectedTokenBalance.token.network,
            ...(!isEthNativeToken(makeToken(selectedTokenBalance.token)) && {
              address: selectedTokenBalance.token.address,
            }),
          },
        },
      });

      registry.set(actionAtom, action);
    }),
});

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

export const useDepositPercentage = (
  walletAddress: WalletAccount["address"],
) => {
  const amount = useAtomValue(amountAtom).pipe(
    Option.map(Number),
    Option.filter((v) => !Number.isNaN(v)),
    Option.getOrElse(() => 0),
  );

  const setAmount = useAtomSet(setAmountFieldAtom);

  const availableBalanceUsd = useAtomValue(
    selectedTokenBalanceAtom(walletAddress),
  ).pipe(
    Result.value,
    Option.filter(Predicate.isNotNull),
    Option.map((balance) => Number(balance.amount) * balance.price),
    Option.getOrElse(() => 0),
  );

  const percentage = clampPercent(
    percentOf({ part: amount, whole: availableBalanceUsd }),
  );

  const handlePercentageChange = (newPercentage: number) => {
    if (newPercentage >= 100) {
      return setAmount(availableBalanceUsd.toString());
    }

    const amount = valueFromPercent({
      total: availableBalanceUsd,
      percent: newPercentage,
    });
    setAmount(round(amount).toString());
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

export const useTokenAmountValue = (
  walletAddress: WalletAccount["address"],
) => {
  const tokenAmountValue = useAtomValue(
    tokenAmountValueAtom(walletAddress),
  ).pipe(Result.getOrElse(() => null));

  return {
    tokenAmountValue,
  };
};
