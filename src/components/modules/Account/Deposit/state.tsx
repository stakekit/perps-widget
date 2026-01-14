import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import { Array as _Array, Effect, Option, Schema } from "effect";
import { actionAtom } from "@/atoms/actions-atoms";
import { providersAtom } from "@/atoms/providers-atoms";
import { moralisTokenBalancesAtom } from "@/atoms/tokens-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { AmountField } from "@/components/molecules/forms";
import type { TokenBalance } from "@/domain/types";
import type { WalletConnected } from "@/domain/wallet";
import { formatAmount } from "@/lib/utils";
import { ApiClientService } from "@/services/api-client";
import type { ProviderDto } from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

const selectedTokenBalanceAtom = Atom.family((wallet: WalletConnected) =>
  Atom.writable(
    (ctx) =>
      ctx
        .get(moralisTokenBalancesAtom(wallet.currentAccount.address))
        .pipe(Result.map(_Array.head), Result.map(Option.getOrNull)),
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
  ).pipe(Result.getOrElse(() => []));

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

  return {
    selectedTokenBalance,
    setSelectedTokenBalance,
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

      if (!wallet || wallet.status !== "connected") {
        yield* Effect.logWarning("No wallet found");
        return;
      }

      const tokenBalance = registry
        .get(selectedTokenBalanceAtom(wallet))
        .pipe(Result.getOrElse(() => null));

      if (!tokenBalance) {
        return { path: ["Amount"], message: "Missing token balance" };
      }

      if (!tokenBalance.price) {
        return;
      }

      const cryptoAmount = values.Amount / tokenBalance.price;

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

      const cryptoAmount =
        decoded.Amount / Number.parseFloat(selectedTokenBalance.amount);

      const action = yield* client.ActionsControllerExecuteAction({
        providerId: selectedProvider.id,
        address: wallet.currentAccount.address,
        action: "fund",
        args: {
          amount: cryptoAmount.toString(),
          fromToken: {
            network: selectedTokenBalance.token.network,
            address: selectedTokenBalance.token.address,
          },
        },
      });

      registry.set(actionAtom, action);
    }),
});

const amountAtom = DepositForm.getFieldAtom(DepositForm.fields.Amount);

const tokenAmountAtom = Atom.family((wallet: WalletConnected) =>
  runtimeAtom.atom((ctx) =>
    Effect.gen(function* () {
      const tokenBalance = yield* ctx.result(selectedTokenBalanceAtom(wallet));

      ctx.subscribe(amountAtom, () => {});

      const amount = ctx.get(amountAtom).pipe(
        Option.map(parseFloat),
        Option.filter((v) => !Number.isNaN(v)),
        Option.getOrElse(() => 0),
      );

      if (!tokenBalance || !tokenBalance.price) {
        return "";
      }

      return `${tokenBalance.token.symbol} ${formatAmount(amount / tokenBalance.price)}`;
    }),
  ),
);

export const useTokenAmount = (wallet: WalletConnected) => {
  const tokenAmount = useAtomValue(tokenAmountAtom(wallet)).pipe(
    Result.getOrElse(() => null),
  );

  return {
    tokenAmount,
  };
};
