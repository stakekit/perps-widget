import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import {
  Array as _Array,
  Number as _Number,
  Effect,
  Option,
  Record,
  Schema,
} from "effect";
import { actionAtom } from "@/atoms/actions-atoms";
import { providersAtom } from "@/atoms/providers-atoms";
import {
  moralisTokenBalancesAtom,
  type TokenBalances,
} from "@/atoms/tokens-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { AmountField } from "@/components/molecules/forms";
import type { TokenBalance } from "@/domain/types";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet";
import { formatTokenAmount } from "@/lib/utils";
import { ApiClientService } from "@/services/api-client";
import type { ProviderDto } from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

const selectedTokenBalanceAtom = Atom.family((wallet: WalletConnected) =>
  Atom.writable(
    (ctx) =>
      ctx.get(moralisTokenBalancesAtom(wallet.currentAccount.address)).pipe(
        Result.map((res) => _Array.head(res.ethereum)),
        Result.map(Option.getOrNull),
      ),
    (ctx, value: TokenBalance) => ctx.setSelf(Result.success(value)),
  ),
);

const selectedProviderAtom = Atom.writable(
  (ctx) =>
    ctx
      .get(providersAtom)
      .pipe(Result.map(_Array.head), Result.map(Option.getOrNull)),
  (ctx, value: ProviderDto) => ctx.setSelf(Result.success(value)),
);

export const useProviders = () => {
  const providers = useAtomValue(providersAtom).pipe(
    Result.getOrElse(() => null),
  );

  return {
    providers,
  };
};

export const useTokenBalances = (wallet: WalletConnected) => {
  const tokenBalances = useAtomValue(
    moralisTokenBalancesAtom(wallet.currentAccount.address),
  ).pipe(Result.getOrElse(() => Record.empty() as TokenBalances));

  return {
    tokenBalances,
  };
};

export const useDepositForm = () => {
  const submit = useAtomSet(DepositForm.submit);
  const submitResult = useAtomValue(DepositForm.submit);

  return {
    submit,
    submitResult,
  };
};

export const useSelectedTokenBalance = (wallet: WalletConnected) => {
  const selectedTokenBalance = useAtomValue(
    selectedTokenBalanceAtom(wallet),
  ).pipe(Result.getOrElse(() => null));
  const setSelectedTokenBalance = useAtomSet(selectedTokenBalanceAtom(wallet));
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

export const useSelectedProvider = () => {
  const selectedProvider = useAtomValue(selectedProviderAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedProvider = useAtomSet(selectedProviderAtom);

  return {
    selectedProvider,
    setSelectedProvider,
  };
};

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
        .get(selectedTokenBalanceAtom(wallet))
        .pipe(Result.getOrElse(() => null));

      if (!tokenBalance) {
        return { path: ["Amount"], message: "Missing token balance" };
      }

      const cryptoAmount = values.Amount / tokenBalance.price;

      if (values.Amount < 10) {
        return { path: ["Amount"], message: "Minimum deposit is $10" };
      }

      if (Number(tokenBalance.amount) < cryptoAmount) {
        return { path: ["Amount"], message: "Insufficient balance" };
      }
    }),
  );

export const DepositForm = FormReact.make(depositFormBuilder, {
  runtime: runtimeAtom,
  fields: { Amount: AmountField },
  onSubmit: ({ wallet }: { wallet: WalletConnected }, { decoded }) =>
    Effect.gen(function* () {
      const client = yield* ApiClientService;
      const registry = yield* Registry.AtomRegistry;

      const selectedTokenBalance = registry
        .get(selectedTokenBalanceAtom(wallet))
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

      const cryptoAmount = decoded.Amount / selectedTokenBalance.price;

      const action = yield* client.ActionsControllerExecuteAction({
        providerId: selectedProvider.id,
        address: wallet.currentAccount.address,
        action: "fund",
        args: {
          amount: cryptoAmount.toString(),
          fromToken: {
            network: selectedTokenBalance.token.network,
            ...(selectedTokenBalance.token.address !==
              "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee" && {
              address: selectedTokenBalance.token.address,
            }),
          },
        },
      });

      registry.set(actionAtom, action);
    }),
});

const amountAtom = DepositForm.getFieldAtom(DepositForm.fields.Amount);
const setAmountFieldAtom = DepositForm.setValue(DepositForm.fields.Amount);

export const useDepositPercentage = (wallet: WalletConnected) => {
  const amount = useAtomValue(amountAtom).pipe(
    Option.map(Number),
    Option.filter((v) => !Number.isNaN(v)),
    Option.getOrElse(() => 0),
  );

  const setAmount = useAtomSet(setAmountFieldAtom);

  const tokenBalance = useAtomValue(selectedTokenBalanceAtom(wallet)).pipe(
    Result.getOrElse(() => null),
  );

  const availableBalanceUsd = tokenBalance
    ? Number(tokenBalance.amount) * tokenBalance.price
    : 0;

  const percentage = _Number.clamp({ minimum: 0, maximum: 100 })(
    (amount / availableBalanceUsd) * 100,
  );

  const handlePercentageChange = (newPercentage: number) => {
    const amount = (availableBalanceUsd * newPercentage) / 100;
    setAmount(parseFloat(amount.toFixed(2)).toString());
  };

  return {
    handlePercentageChange,
    percentage: Math.round(percentage),
  };
};

const tokenAmountValueAtom = Atom.family((wallet: WalletConnected) =>
  runtimeAtom.atom((ctx) =>
    Effect.gen(function* () {
      const tokenBalance = yield* ctx.result(selectedTokenBalanceAtom(wallet));

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
        amount: amount / tokenBalance.price,
        symbol: tokenBalance.token.symbol,
      });
    }),
  ),
);

export const useTokenAmountValue = (wallet: WalletConnected) => {
  const tokenAmountValue = useAtomValue(tokenAmountValueAtom(wallet)).pipe(
    Result.getOrElse(() => null),
  );

  return {
    tokenAmountValue,
  };
};
