import { EvmNetworks } from "@stakekit/common";

const supportedEVMChains = [
  EvmNetworks.Ethereum,
  EvmNetworks.Base,
  EvmNetworks.Arbitrum,
  EvmNetworks.Optimism,
  EvmNetworks.Monad,
  EvmNetworks.HyperEVM,
] as const;

export type SupportedEvmChain = (typeof supportedEVMChains)[number];

export type EvmChainsMap = {
  [Key in SupportedEvmChain]: {
    type: "evm";
    skChainName: Key;
  };
};

export const evmChainsMap = supportedEVMChains.reduce<EvmChainsMap>(
  (acc, next) => {
    return {
      // biome-ignore lint/performance/noAccumulatingSpread: ok here
      ...acc,
      [next]: {
        type: "evm",
        skChainName: next,
      },
    };
  },
  {} as EvmChainsMap,
);
