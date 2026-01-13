import type {
  Account,
  CryptoCurrency,
  Currency,
  ERC20TokenCurrency,
  WalletAPIClient,
} from "@ledgerhq/wallet-api-client";
import { Data, Effect, Option, Record } from "effect";
import type { SupportedSKChains } from "@/domain/chains";
import type { EvmChainsMap } from "@/domain/chains/evm";
import {
  type SupportedLedgerLiveFamilies,
  supportedLedgerFamiliesWithCurrency,
} from "@/domain/chains/ledger";

export const getFilteredSupportedLedgerFamiliesWithCurrency = ({
  accounts,
  ledgerCurrencies,
  enabledChainsMap,
}: {
  accounts: Account[];
  ledgerCurrencies: Effect.Effect.Success<
    ReturnType<typeof getLedgerCurrencies>
  >;
  enabledChainsMap: { evm: Partial<EvmChainsMap> };
}) => {
  const { accountsFamilies, accountsCurrencies } = accounts.reduce(
    (acc, next) => {
      const family = ledgerCurrencies.get(next.currency);

      if (family) {
        acc.accountsFamilies.add(family);
        acc.accountsCurrencies.add(next.currency);
      }

      return acc;
    },
    { accountsFamilies: new Set(), accountsCurrencies: new Set() },
  );

  const v = Record.map(
    supportedLedgerFamiliesWithCurrency,
    Record.filter((s, key) => {
      const chain = enabledChainsMap.evm[s.skChainName]?.skChainName;

      if (!chain) return false;

      if (
        accountsFamilies.has(s.family) &&
        ((key as typeof key | "*") === "*" ||
          accountsCurrencies.has(s.currencyId))
      ) {
        return true;
      }

      return false;
    }),
  );

  type V = typeof v;
  type Key = keyof V;

  return Object.keys(v).reduce(
    (acc, key) => {
      const subItem = v[key as Key];

      type SubItemKey = keyof typeof subItem;

      const subItemMap = Object.keys(subItem).reduce((acc, subKey) => {
        acc.set(subKey as SubItemKey, subItem[subKey as keyof typeof subItem]);

        return acc;
      }, new Map<SubItemKey, V[Key][SubItemKey]>());

      acc.set(key as Key, subItemMap);

      return acc;
    },
    new Map<
      Key,
      Map<
        "*" | (string & {}),
        {
          currencyId: string;
          family: SupportedLedgerLiveFamilies;
          skChainName: SupportedSKChains;
        }
      >
    >(),
  );
};

export const getLedgerCurrencies = (walletApiClient: WalletAPIClient) =>
  Effect.tryPromise({
    try: () =>
      walletApiClient.currency.list({
        currencyIds: Object.values(supportedLedgerFamiliesWithCurrency).flatMap(
          (chain) =>
            Object.values(chain).map((currency) => currency.currencyId),
        ),
      }),
    catch: (error) => new GetCurrenciesError({ cause: error }),
  }).pipe(
    Effect.map((val) =>
      val.reduce(
        (acc, next) => {
          if (next.type === "CryptoCurrency") {
            acc.cryptoCurrency.set(next.id, next.family);
          } else {
            acc.tokenCurrency.push(next);
          }

          return acc;
        },
        { cryptoCurrency: new Map(), tokenCurrency: [] } as {
          cryptoCurrency: Map<Currency["id"], CryptoCurrency["family"]>;
          tokenCurrency: ERC20TokenCurrency[];
        },
      ),
    ),
    Effect.map((val) => {
      val.tokenCurrency.forEach((t) => {
        const parentCryptoCurrencyFamily = val.cryptoCurrency.get(t.parent);

        if (parentCryptoCurrencyFamily) {
          val.cryptoCurrency.set(t.id, parentCryptoCurrencyFamily);
        }
      });

      return val.cryptoCurrency;
    }),
  );

export const getLedgerAccounts = (walletApiClient: WalletAPIClient) =>
  Effect.tryPromise({
    try: () => walletApiClient.account.list(),
    catch: (error) => new GetAccountsError({ cause: error }),
  }).pipe(
    Effect.map((val) => ({
      accounts: val,
      accountsMap: new Map<Account["id"], Account>(val.map((v) => [v.id, v])),
    })),
    Effect.map((val) =>
      val.accounts.map((acc) => {
        if (!acc.parentAccountId) return acc;

        return Option.fromNullable(
          val.accountsMap.get(acc.parentAccountId),
        ).pipe(
          Option.map((parentAcc) => ({
            ...acc,
            currency: parentAcc.currency,
          })),
          Option.getOrElse(() => acc),
        );
      }),
    ),
  );

export const isLedgerDappBrowserProvider = (() => {
  let state: boolean | null = null;

  return (): boolean => {
    if (typeof state === "boolean") return state;

    return Option.fromNullable(window).pipe(
      Option.map((w) => {
        try {
          const params = new URLSearchParams(w.self.location.search);

          state = !!params.get("embed");
        } catch (_error) {
          state = false;
        }

        return !!state;
      }),
      Option.getOrElse(() => false),
    );
  };
})();

export class GetAccountsError extends Data.TaggedError("GetAccountsError")<{
  cause: unknown;
}> {}

export class GetCurrenciesError extends Data.TaggedError("GetCurrenciesError")<{
  cause: unknown;
}> {}

export class NoAccountsFoundError extends Data.TaggedError(
  "NoAccountsFoundError",
) {}
