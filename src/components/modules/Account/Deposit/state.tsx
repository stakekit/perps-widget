import {
  Atom,
  Registry,
  Result,
  useAtomSet,
  useAtomValue,
} from "@effect-atom/atom-react";
import { FormBuilder, FormReact } from "@lucas-barake/effect-form-react";
import { Array as _Array, Effect, Option, Record, Schema } from "effect";
import { depositActionAtom } from "@/atoms/deposit-action-atom";
import { providersAtom } from "@/atoms/providers-atoms";
import { tokenBalancesAtom, tokenPricesAtom } from "@/atoms/tokens-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { AmountField } from "@/components/molecules/forms";
import { formatAmount, getTokenString } from "@/lib/utils";
import { ApiClientService } from "@/services/api-client";
import {
  type BalanceResponseDto,
  PriceRequestDto,
  type ProviderDto,
  TokenDto,
} from "@/services/api-client/api-schemas";
import { runtimeAtom } from "@/services/runtime";

const selectedTokenBalanceAtom = Atom.writable(
  (ctx) =>
    ctx
      .get(tokenBalancesAtom)
      .pipe(Result.map(_Array.head), Result.map(Option.getOrNull)),
  (ctx, value: BalanceResponseDto) => ctx.setSelf(Result.success(value)),
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

export const useTokenBalances = () => {
  const tokenBalances = useAtomValue(tokenBalancesAtom).pipe(
    Result.getOrElse(() => null),
  );

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

export const useSelectedTokenBalance = () => {
  const selectedTokenBalance = useAtomValue(selectedTokenBalanceAtom).pipe(
    Result.getOrElse(() => null),
  );
  const setSelectedTokenBalance = useAtomSet(selectedTokenBalanceAtom);

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

const priceRequestAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const selectedTokenBalance = ctx
      .get(selectedTokenBalanceAtom)
      .pipe(Result.getOrElse(() => null));

    if (!selectedTokenBalance) {
      return null;
    }

    return PriceRequestDto.make({
      currency: "usd",
      tokenList: [
        TokenDto.make({
          ...selectedTokenBalance.token,
        }),
      ],
    });
  }),
);

const selectedTokenPriceAtom = runtimeAtom.atom(
  Effect.fn(function* (ctx) {
    const selectedTokenBalance = ctx
      .get(selectedTokenBalanceAtom)
      .pipe(Result.getOrElse(() => null));

    if (!selectedTokenBalance) {
      return yield* Effect.dieMessage("No selected token balance");
    }

    const priceRequest = yield* ctx.result(priceRequestAtom);

    if (!priceRequest) {
      return yield* Effect.dieMessage("No price request");
    }

    const tokenPrices = yield* ctx.result(tokenPricesAtom(priceRequest));

    const price = Record.get(
      tokenPrices,
      getTokenString(priceRequest.tokenList[0]),
    ).pipe(Option.getOrNull);

    if (!price) {
      return yield* Effect.dieMessage("No token prices");
    }

    return {
      token: selectedTokenBalance.token,
      price,
    };
  }),
);

const tokenAmountAtom = runtimeAtom
  .atom(
    Effect.fn(function* (ctx) {
      const tokenPrice = yield* ctx.result(selectedTokenPriceAtom);

      const amount = ctx
        .get(DepositForm.getFieldAtom(DepositForm.fields.Amount))
        .pipe(
          Option.map(parseFloat),
          Option.filter((v) => !Number.isNaN(v)),
          Option.getOrElse(() => 0),
        );

      return `${tokenPrice.token.symbol} ${formatAmount(amount / tokenPrice.price.price)}`;
    }),
  )
  .pipe(Atom.keepAlive);

export const useTokenAmount = () => {
  const tokenAmount = useAtomValue(tokenAmountAtom).pipe(
    Result.getOrElse(() => null),
  );

  return {
    tokenAmount,
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

      const tokenBalance = registry
        .get(selectedTokenBalanceAtom)
        .pipe(Result.getOrElse(() => null));

      if (!tokenBalance) {
        return { path: ["Amount"], message: "Missing token balance" };
      }

      const tokenPrice = registry
        .get(selectedTokenPriceAtom)
        .pipe(Result.getOrElse(() => null));

      if (!tokenPrice?.price) {
        return { path: ["Amount"], message: "Missing token price" };
      }

      const cryptoAmount = values.Amount / tokenPrice.price.price;

      if (Number(tokenBalance.amount) < cryptoAmount) {
        return { path: ["Amount"], message: "Insufficient balance" };
      }
    }),
  );

export const DepositForm = FormReact.make(depositFormBuilder, {
  runtime: runtimeAtom,
  fields: { Amount: AmountField },
  onSubmit: (_, { decoded }) =>
    Effect.gen(function* () {
      const client = yield* ApiClientService;
      const registry = yield* Registry.AtomRegistry;

      const selectedTokenBalance = registry
        .get(selectedTokenBalanceAtom)
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

      const wallet = registry
        .get(walletAtom)
        .pipe(Result.getOrElse(() => null));

      if (!wallet) {
        return yield* Effect.dieMessage("No wallet");
      }

      const tokenPrice = registry
        .get(selectedTokenPriceAtom)
        .pipe(Result.getOrElse(() => null));

      if (!tokenPrice) {
        return yield* Effect.dieMessage("No token price");
      }

      const cryptoAmount = decoded.Amount / tokenPrice.price.price;

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

      registry.set(depositActionAtom, action);
    }),
});
