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
    polygon: {
      currencyId: "polygon",
      family: "ethereum",
      skChainName: EvmNetworks.Polygon,
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
    avalanche_c_chain: {
      currencyId: "avalanche_c_chain",
      family: "ethereum",
      skChainName: EvmNetworks.AvalancheC,
    },
    ethereum_hoodi: {
      currencyId: "ethereum_hoodi",
      family: "ethereum",
      skChainName: EvmNetworks.EthereumHoodi,
    },
    bsc: {
      currencyId: "bsc",
      family: "ethereum",
      skChainName: EvmNetworks.Binance,
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
