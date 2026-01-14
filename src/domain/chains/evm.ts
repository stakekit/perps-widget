import { EvmNetworks } from "@stakekit/common";

const supportedEVMChains = [
  EvmNetworks.AvalancheC,
  EvmNetworks.Arbitrum,
  EvmNetworks.Binance,
  EvmNetworks.Celo,
  EvmNetworks.Ethereum,
  EvmNetworks.EthereumGoerli,
  EvmNetworks.Harmony,
  EvmNetworks.Optimism,
  EvmNetworks.Polygon,
  EvmNetworks.Viction,
  EvmNetworks.EthereumHoodi,
  EvmNetworks.Base,
  EvmNetworks.Linea,
  EvmNetworks.Core,
  EvmNetworks.Sonic,
  EvmNetworks.EthereumSepolia,
  EvmNetworks.Unichain,
  EvmNetworks.Katana,
  EvmNetworks.Gnosis,
  EvmNetworks.HyperEVM,
  EvmNetworks.Plasma,
  EvmNetworks.Monad,
  EvmNetworks.MonadTestnet,
] as const;

export const supportedEVMChainsSet = new Set(supportedEVMChains);

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
