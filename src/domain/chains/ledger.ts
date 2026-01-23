import type { Currency, Families } from "@ledgerhq/wallet-api-client";
import { EvmNetworks } from "@stakekit/common";
import type { SupportedSKChains } from "@/domain/chains";

export type SupportedLedgerLiveFamilies = Extract<Families, "ethereum">;

export const supportedLedgerFamiliesWithCurrency = {
  ethereum: {
    ethereum: {
      currencyId: "ethereum",
      family: "ethereum",
      skChainName: EvmNetworks.Ethereum,
    },
    base: {
      currencyId: "base",
      family: "ethereum",
      skChainName: EvmNetworks.Base,
    },
    arbitrum: {
      currencyId: "arbitrum",
      family: "ethereum",
      skChainName: EvmNetworks.Arbitrum,
    },
    optimism: {
      currencyId: "optimism",
      family: "ethereum",
      skChainName: EvmNetworks.Optimism,
    },
    monad: {
      currencyId: "monad",
      family: "ethereum",
      skChainName: EvmNetworks.Monad,
    },
    hyperevm: {
      currencyId: "hyperevm",
      family: "ethereum",
      skChainName: EvmNetworks.HyperEVM,
    },
  },
} as const satisfies SupportedLedgerFamiliesWithCurrency;

export type SupportedLedgerFamiliesWithCurrency = Record<
  SupportedLedgerLiveFamilies,
  Partial<
    Record<
      (Currency["id"] & {}) | "*",
      {
        family: SupportedLedgerLiveFamilies;
        currencyId: Currency["id"];
        skChainName: SupportedSKChains;
      }
    >
  >
>;
