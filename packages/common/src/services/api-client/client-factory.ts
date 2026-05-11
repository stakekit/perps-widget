import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import type * as HttpClient from "effect/unstable/http/HttpClient"
import * as HttpClientError from "effect/unstable/http/HttpClientError"
import * as HttpClientRequest from "effect/unstable/http/HttpClientRequest"
import * as HttpClientResponse from "effect/unstable/http/HttpClientResponse"
// non-recursive definitions
export type ArgumentSchemaDto = { readonly "type"?: {  }, readonly "properties"?: {  }, readonly "required"?: ReadonlyArray<string>, readonly "additionalProperties"?: {  }, readonly "items"?: { readonly "type"?: {  }, readonly "description"?: string, readonly "enum"?: ReadonlyArray<string>, readonly "default"?: {  }, readonly "minimum"?: number, readonly "maximum"?: number, readonly "minLength"?: number, readonly "maxLength"?: number, readonly "pattern"?: string, readonly "items"?: {  }, readonly "properties"?: {  }, readonly "required"?: ReadonlyArray<string>, readonly "additionalProperties"?: {  }, readonly "label"?: string, readonly "placeholder"?: string, readonly "optionsRef"?: string, readonly "options"?: ReadonlyArray<string> }, readonly "enum"?: ReadonlyArray<string>, readonly "default"?: {  }, readonly "notes"?: string }
export type PerpActionTypes = "open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "editOrder" | "fund" | "withdraw" | "approveAgent" | "approveBuilderFee" | "updateMargin" | "setTpAndSl"
export type MarketDto = { readonly "id": string, readonly "providerId": string, readonly "baseAsset": { readonly "symbol": string, readonly "name"?: string, readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "decimals"?: number, readonly "address"?: string, readonly "logoURI"?: string }, readonly "quoteAsset": { readonly "symbol": string, readonly "name"?: string, readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "decimals"?: number, readonly "address"?: string, readonly "logoURI"?: string }, readonly "leverageRange": ReadonlyArray<number>, readonly "supportedMarginModes": ReadonlyArray<"isolated" | "cross">, readonly "markPrice": number, readonly "oraclePrice": number, readonly "priceChange24h": number, readonly "priceChangePercent24h": number, readonly "volume24h": number, readonly "openInterest": number, readonly "makerFee"?: string, readonly "takerFee"?: string, readonly "fundingRate": string, readonly "fundingRateIntervalHours": number, readonly "minSize": number, readonly "metadata": { readonly "name": string, readonly "logoURI": string, readonly "url": string } }
export type MarketDetailDto = { readonly "id": string, readonly "providerId": string, readonly "baseAsset": { readonly "symbol": string, readonly "name"?: string, readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "decimals"?: number, readonly "address"?: string, readonly "logoURI"?: string }, readonly "quoteAsset": { readonly "symbol": string, readonly "name"?: string, readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "decimals"?: number, readonly "address"?: string, readonly "logoURI"?: string }, readonly "leverageRange": ReadonlyArray<number>, readonly "supportedMarginModes": ReadonlyArray<"isolated" | "cross">, readonly "markPrice": number, readonly "oraclePrice": number, readonly "priceChange24h": number, readonly "priceChangePercent24h": number, readonly "volume24h": number, readonly "openInterest": number, readonly "makerFee"?: string, readonly "takerFee"?: string, readonly "fundingRate": string, readonly "fundingRateIntervalHours": number, readonly "minSize": number, readonly "metadata": { readonly "name": string, readonly "logoURI": string, readonly "url": string }, readonly "chartConfig": { readonly "pricescale": number, readonly "minmov": number, readonly "supportedResolutions": ReadonlyArray<string>, readonly "hasIntraday": boolean, readonly "hasDaily": boolean } }
export type CandleDto = { readonly "openTime": number, readonly "closeTime": number, readonly "open": string, readonly "high": string, readonly "low": string, readonly "close": string, readonly "volume": string, readonly "trades": number }
export type PortfolioRequestDto = { readonly "address": string, readonly "providerId": string }
export type TokenIdentifierDto = { readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "address"?: string }
export type PendingActionDto = { readonly "type": "open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "editOrder" | "fund" | "withdraw" | "approveAgent" | "approveBuilderFee" | "updateMargin" | "setTpAndSl", readonly "label": string, readonly "args": { readonly "marketId"?: string, readonly "side"?: "long" | "short", readonly "amount"?: string, readonly "size"?: string, readonly "leverage"?: number, readonly "marginMode"?: "cross" | "isolated", readonly "limitPrice"?: number, readonly "stopLossPrice"?: number, readonly "takeProfitPrice"?: number, readonly "orderId"?: string, readonly "orderIds"?: ReadonlyArray<string>, readonly "assetIndex"?: number, readonly "fromToken"?: { readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "address"?: string }, readonly "agentAddress"?: string, readonly "agentName"?: string, readonly "validUntil"?: number, readonly "stopLossOrderId"?: string, readonly "takeProfitOrderId"?: string, readonly "skipApproval"?: boolean, readonly "fundingMethod"?: "bridge2" | "lifi" } }
export type BalanceDto = { readonly "providerId": string, readonly "collateral": { readonly "symbol": string, readonly "name"?: string, readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "decimals"?: number, readonly "address"?: string, readonly "logoURI"?: string }, readonly "accountValue": number, readonly "usedMargin": number, readonly "availableBalance": number, readonly "unrealizedPnl": number }
export type ActionRequestDto = { readonly "providerId": string, readonly "address": string, readonly "action": "open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "editOrder" | "fund" | "withdraw" | "approveAgent" | "approveBuilderFee" | "updateMargin" | "setTpAndSl", readonly "args": { readonly "marketId"?: string, readonly "side"?: "long" | "short", readonly "amount"?: string, readonly "size"?: string, readonly "leverage"?: number, readonly "marginMode"?: "cross" | "isolated", readonly "limitPrice"?: number, readonly "stopLossPrice"?: number, readonly "takeProfitPrice"?: number, readonly "orderId"?: string, readonly "orderIds"?: ReadonlyArray<string>, readonly "assetIndex"?: number, readonly "fromToken"?: { readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "address"?: string }, readonly "agentAddress"?: string, readonly "agentName"?: string, readonly "validUntil"?: number, readonly "stopLossOrderId"?: string, readonly "takeProfitOrderId"?: string, readonly "skipApproval"?: boolean, readonly "fundingMethod"?: "bridge2" | "lifi" } }
export type ActionStatus = "CANCELED" | "CREATED" | "WAITING_FOR_NEXT" | "PROCESSING" | "FAILED" | "SUCCESS" | "STALE"
export type TransactionDto = { readonly "id": string, readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "chainId": string, readonly "type": "APPROVAL" | "OPEN_POSITION" | "CLOSE_POSITION" | "UPDATE_LEVERAGE" | "STOP_LOSS" | "TAKE_PROFIT" | "CANCEL_ORDER" | "EDIT_ORDER" | "FUND" | "WITHDRAW" | "APPROVE_BUILDER_FEE" | "ENABLE_DEX_ABSTRACTION" | "APPROVE_AGENT" | "UPDATE_MARGIN" | "SET_TP_AND_SL", readonly "status": "CREATED" | "QUEUED" | "BROADCASTED" | "CONFIRMED" | "FAILED" | "NOT_FOUND", readonly "address": string, readonly "args"?: { readonly "marketId"?: string, readonly "side"?: "long" | "short", readonly "amount"?: string, readonly "size"?: string, readonly "leverage"?: number, readonly "marginMode"?: "cross" | "isolated", readonly "limitPrice"?: number, readonly "stopLossPrice"?: number, readonly "takeProfitPrice"?: number, readonly "orderId"?: string, readonly "orderIds"?: ReadonlyArray<string>, readonly "assetIndex"?: number, readonly "fromToken"?: { readonly "network": "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid", readonly "address"?: string }, readonly "agentAddress"?: string, readonly "agentName"?: string, readonly "validUntil"?: number, readonly "stopLossOrderId"?: string, readonly "takeProfitOrderId"?: string, readonly "skipApproval"?: boolean, readonly "fundingMethod"?: "bridge2" | "lifi" }, readonly "signingFormat"?: "EVM_TRANSACTION" | "EIP712_TYPED_DATA" | "SOLANA_TRANSACTION" | "COSMOS_TRANSACTION", readonly "signablePayload"?: {  }, readonly "rawPayload"?: {  }, readonly "explorerUrls": ReadonlyArray<string> }
export type PerpEventType = "order_filled" | "liquidation" | "stop_loss_triggered" | "take_profit_triggered"
export type SubmitTransactionDto = { readonly "signedPayload"?: string, readonly "transactionHash"?: string }
export type SubmitTransactionResponseDto = { readonly "transactionHash"?: string, readonly "link": string, readonly "status": "CREATED" | "QUEUED" | "BROADCASTED" | "CONFIRMED" | "FAILED" | "NOT_FOUND", readonly "error"?: string, readonly "details"?: {  } }
export type HealthStatusDto = { readonly "status": "OK" | "FAIL", readonly "timestamp": string }
export type ProviderDto = { readonly "id": string, readonly "name": string, readonly "network": string, readonly "metadata": { readonly "description": string, readonly "externalLink": string, readonly "logoURI": string }, readonly "supportedActions": "open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "editOrder" | "fund" | "withdraw" | "approveAgent" | "approveBuilderFee" | "updateMargin" | "setTpAndSl", readonly "argumentSchemas": { readonly [x: string]: ArgumentSchemaDto } }
export type CandlesResponseDto = { readonly "marketId": string, readonly "interval": "1m" | "5m" | "15m" | "1h" | "4h" | "1d", readonly "candles": ReadonlyArray<CandleDto> }
export type PositionDto = { readonly "marketId": string, readonly "side": "long" | "short", readonly "size": string, readonly "entryPrice": number, readonly "markPrice": number, readonly "leverage": number, readonly "marginMode": "cross" | "isolated", readonly "margin": number, readonly "unrealizedPnl": number, readonly "funding": number, readonly "liquidationPrice": number, readonly "pendingActions": ReadonlyArray<PendingActionDto> }
export type OrderDto = { readonly "marketId": string, readonly "side": "long" | "short", readonly "type": "market" | "limit" | "stop_loss" | "take_profit", readonly "size": string, readonly "limitPrice"?: number, readonly "triggerPrice"?: number, readonly "leverage"?: number, readonly "margin"?: number, readonly "reduceOnly": boolean, readonly "createdAt": number, readonly "pendingActions": ReadonlyArray<PendingActionDto> }
export type ActionDto = { readonly "id": string, readonly "providerId": string, readonly "action": "open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "editOrder" | "fund" | "withdraw" | "approveAgent" | "approveBuilderFee" | "updateMargin" | "setTpAndSl", readonly "status": "CANCELED" | "CREATED" | "WAITING_FOR_NEXT" | "PROCESSING" | "FAILED" | "SUCCESS" | "STALE", readonly "summary": { readonly "type": "Open Position" | "Close Position" | "Stop Loss" | "Take Profit" | "Set TP & SL" | "Cancel Order" | "Edit Order" | "Update Leverage" | "Update Margin" | "Fund Account" | "Withdraw" | "Approve Agent" | "Approve Builder Fee", readonly "assetId"?: number, readonly "orderType"?: "market" | "limit", readonly "direction"?: "long" | "short", readonly "asset"?: string, readonly "price"?: number, readonly "size"?: string, readonly "leverage"?: number, readonly "collateral"?: string, readonly "fee"?: string, readonly "orderValue"?: number, readonly "stopLoss"?: number, readonly "takeProfit"?: number, readonly "oldLiquidationPrice"?: number, readonly "estimatedLiquidationPrice"?: number, readonly "oldStopLoss"?: number, readonly "oldTakeProfit"?: number, readonly "marginMode"?: "cross" | "isolated", readonly "orderId"?: string, readonly "orderIds"?: ReadonlyArray<string>, readonly "cancelledOrderTypes"?: ReadonlyArray<"tp" | "sl">, readonly "amount"?: string, readonly "fromToken"?: TokenIdentifierDto, readonly "method"?: string, readonly "agentAddress"?: string, readonly "agentName"?: string, readonly "closedPrice"?: number, readonly "pnl"?: string, readonly "margin"?: string, readonly "entryPrice"?: number, readonly "exitPrice"?: number } | null, readonly "signedMetadata"?: {  }, readonly "transactions": ReadonlyArray<TransactionDto>, readonly "createdAt": string, readonly "completedAt": string }
export type EventDto = { readonly "id": string, readonly "eventType": PerpEventType, readonly "providerId": string, readonly "occurredAt": string, readonly "marketId"?: string | null, readonly "perpActionId"?: string, readonly "providerOrderId"?: string | null, readonly "explorerUrl"?: string | null, readonly "order": { readonly "orderId": string, readonly "marketId": string, readonly "asset": string, readonly "side": "buy" | "sell", readonly "type": "market" | "limit" | "stop_loss" | "take_profit", readonly "originalSizeBase": string, readonly "remainingSizeBase": string, readonly "limitPrice"?: number, readonly "timeInForce"?: "ioc" | "gtc" | "alo", readonly "triggerPrice"?: number, readonly "reduceOnly": boolean, readonly "isPositionLevel": boolean, readonly "clientOrderId": {  } | null, readonly "childOrderIds": ReadonlyArray<string>, readonly "createdAt": string, readonly "closedPnl"?: string, readonly "fillPrice"?: number } }
export type ActivityActionItemDto = { readonly "type": "event" | "action", readonly "action": ActionDto }
export type ActivityEventItemDto = { readonly "type": "event" | "action", readonly "event": EventDto }
// schemas
export type ProvidersControllerGetProviders200 = ReadonlyArray<ProviderDto>
export type ProvidersControllerGetProviders401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type ProvidersControllerGetProviders429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type ProvidersControllerGetProvider200 = ProviderDto
export type ProvidersControllerGetProvider401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type ProvidersControllerGetProvider429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type MarketsControllerGetMarketsParams = { readonly "offset"?: number, readonly "limit"?: number, readonly "providerId"?: "hyperliquid" | "hyperliquid-xyz", readonly "sortBy"?: "volume24h" | "markPrice" | "priceChangePercent24h", readonly "order"?: "asc" | "desc" }
export type MarketsControllerGetMarkets200 = { readonly "total": number, readonly "offset": number, readonly "limit": number, readonly "items"?: ReadonlyArray<MarketDto> }
export type MarketsControllerGetMarkets401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type MarketsControllerGetMarkets429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type MarketsControllerGetCandlesParams = { readonly "interval": "1m" | "5m" | "15m" | "1h" | "4h" | "1d", readonly "from": number, readonly "to"?: number }
export type MarketsControllerGetCandles200 = CandlesResponseDto
export type MarketsControllerGetCandles401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type MarketsControllerGetCandles429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type MarketsControllerGetMarketById200 = MarketDetailDto
export type MarketsControllerGetMarketById401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type MarketsControllerGetMarketById429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type PortfolioControllerGetPositionsRequestJson = PortfolioRequestDto
export type PortfolioControllerGetPositions200 = ReadonlyArray<PositionDto>
export type PortfolioControllerGetPositions401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type PortfolioControllerGetPositions429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type PortfolioControllerGetOrdersRequestJson = PortfolioRequestDto
export type PortfolioControllerGetOrders200 = ReadonlyArray<OrderDto>
export type PortfolioControllerGetOrders401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type PortfolioControllerGetOrders429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type PortfolioControllerGetBalancesRequestJson = PortfolioRequestDto
export type PortfolioControllerGetBalances200 = BalanceDto
export type PortfolioControllerGetBalances401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type PortfolioControllerGetBalances429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type ActionsControllerGetActionsParams = { readonly "offset"?: number, readonly "limit"?: number, readonly "address": string, readonly "providerId": string, readonly "status"?: ActionStatus, readonly "statuses"?: ReadonlyArray<ActionStatus>, readonly "type"?: PerpActionTypes, readonly "marketId"?: string }
export type ActionsControllerGetActions200 = { readonly "total": number, readonly "offset": number, readonly "limit": number, readonly "items"?: ReadonlyArray<ActionDto> }
export type ActionsControllerGetActions401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type ActionsControllerGetActions429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type ActionsControllerExecuteActionRequestJson = ActionRequestDto
export type ActionsControllerExecuteAction200 = ActionDto
export type ActionsControllerExecuteAction401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type ActionsControllerExecuteAction429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type ActionsControllerGetAction200 = ActionDto
export type ActionsControllerGetAction401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type ActionsControllerGetAction429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type ActivityControllerGetActivityParams = { readonly "offset"?: number, readonly "limit"?: number, readonly "address": string, readonly "providerId": string, readonly "actionStatus"?: ActionStatus, readonly "actionStatuses"?: ReadonlyArray<ActionStatus> }
export type ActivityControllerGetActivity200 = { readonly "total": number, readonly "offset": number, readonly "limit": number, readonly "items"?: ReadonlyArray<ActivityEventItemDto | ActivityActionItemDto> }
export type ActivityControllerGetActivity401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type ActivityControllerGetActivity429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type EventsControllerGetEventsParams = { readonly "offset"?: number, readonly "limit"?: number, readonly "address": string, readonly "providerId": string, readonly "eventType"?: PerpEventType, readonly "eventTypes"?: ReadonlyArray<PerpEventType>, readonly "marketId"?: string, readonly "perpActionId"?: string, readonly "providerOrderId"?: string, readonly "fromDate"?: string, readonly "toDate"?: string }
export type EventsControllerGetEvents200 = { readonly "total": number, readonly "offset": number, readonly "limit": number, readonly "items"?: ReadonlyArray<EventDto> }
export type EventsControllerGetEvents401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type EventsControllerGetEvents429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type EventsControllerGetEvent200 = EventDto
export type EventsControllerGetEvent401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type EventsControllerGetEvent429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type TransactionsControllerSubmitTransactionRequestJson = SubmitTransactionDto
export type TransactionsControllerSubmitTransaction200 = SubmitTransactionResponseDto
export type TransactionsControllerSubmitTransaction401 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number }
export type TransactionsControllerSubmitTransaction429 = { readonly "message"?: string, readonly "error"?: string, readonly "statusCode"?: number, readonly "retryAfter"?: number }
export type HealthControllerHealth200 = HealthStatusDto

export interface OperationConfig {
  /**
   * Whether or not the response should be included in the value returned from
   * an operation.
   *
   * If set to `true`, a tuple of `[A, HttpClientResponse]` will be returned,
   * where `A` is the success type of the operation.
   *
   * If set to `false`, only the success type of the operation will be returned.
   */
  readonly includeResponse?: boolean | undefined
}

/**
 * A utility type which optionally includes the response in the return result
 * of an operation based upon the value of the `includeResponse` configuration
 * option.
 */
export type WithOptionalResponse<A, Config extends OperationConfig> = Config extends {
  readonly includeResponse: true
} ? [A, HttpClientResponse.HttpClientResponse] : A

export const make = (
  httpClient: HttpClient.HttpClient,
  options: {
    readonly transformClient?: ((client: HttpClient.HttpClient) => Effect.Effect<HttpClient.HttpClient>) | undefined
  } = {}
): SKClient => {
  const unexpectedStatus = (response: HttpClientResponse.HttpClientResponse) =>
    Effect.flatMap(
      Effect.orElseSucceed(response.json, () => "Unexpected status code"),
      (description) =>
        Effect.fail(
          new HttpClientError.HttpClientError({
            reason: new HttpClientError.StatusCodeError({
              request: response.request,
              response,
              description: typeof description === "string" ? description : JSON.stringify(description),
            }),
          }),
        ),
    )
  const withResponse = <Config extends OperationConfig>(config: Config | undefined) => (
    f: (response: HttpClientResponse.HttpClientResponse) => Effect.Effect<any, any>,
  ): (request: HttpClientRequest.HttpClientRequest) => Effect.Effect<any, any> => {
    const withOptionalResponse = (
      config?.includeResponse
        ? (response: HttpClientResponse.HttpClientResponse) => Effect.map(f(response), (a) => [a, response])
        : (response: HttpClientResponse.HttpClientResponse) => f(response)
    ) as any
    return options?.transformClient
      ? (request) =>
          Effect.flatMap(
            Effect.flatMap(options.transformClient!(httpClient), (client) => client.execute(request)),
            withOptionalResponse
          )
      : (request) => Effect.flatMap(httpClient.execute(request), withOptionalResponse)
  }
  const decodeSuccess = <A>(response: HttpClientResponse.HttpClientResponse) =>
    response.json as Effect.Effect<A, HttpClientError.HttpClientError>
  const decodeVoid = (_response: HttpClientResponse.HttpClientResponse) =>
    Effect.void
  const decodeError =
    <Tag extends string, E>(tag: Tag) =>
    (
      response: HttpClientResponse.HttpClientResponse,
    ): Effect.Effect<
      never,
      SKClientError<Tag, E> | HttpClientError.HttpClientError
    > =>
      Effect.flatMap(
        response.json as Effect.Effect<E, HttpClientError.HttpClientError>,
        (cause) => Effect.fail(SKClientError(tag, cause, response)),
      )
  const onRequest = <Config extends OperationConfig>(config: Config | undefined) => (
    successCodes: ReadonlyArray<string>,
    errorCodes?: Record<string, string>,
  ) => {
    const cases: any = { orElse: unexpectedStatus }
    for (const code of successCodes) {
      cases[code] = decodeSuccess
    }
    if (errorCodes) {
      for (const [code, tag] of Object.entries(errorCodes)) {
        cases[code] = decodeError(tag)
      }
    }
    if (successCodes.length === 0) {
      cases["2xx"] = decodeVoid
    }
    return withResponse(config)(HttpClientResponse.matchStatus(cases) as any)
  }
  return {
    httpClient,
    "ProvidersControllerGetProviders": (options) => HttpClientRequest.get(`/v1/providers`).pipe(
    onRequest(options?.config)(["2xx"], {"401":"ProvidersControllerGetProviders401","429":"ProvidersControllerGetProviders429"})
  ),
    "ProvidersControllerGetProvider": (providerId, options) => HttpClientRequest.get(`/v1/providers/${providerId}`).pipe(
    onRequest(options?.config)(["2xx"], {"401":"ProvidersControllerGetProvider401","429":"ProvidersControllerGetProvider429"})
  ),
    "MarketsControllerGetMarkets": (options) => HttpClientRequest.get(`/v1/markets`).pipe(
    HttpClientRequest.setUrlParams({ "offset": options?.params?.["offset"] as any, "limit": options?.params?.["limit"] as any, "providerId": options?.params?.["providerId"] as any, "sortBy": options?.params?.["sortBy"] as any, "order": options?.params?.["order"] as any }),
    onRequest(options?.config)(["2xx"], {"401":"MarketsControllerGetMarkets401","429":"MarketsControllerGetMarkets429"})
  ),
    "MarketsControllerGetCandles": (marketId, options) => HttpClientRequest.get(`/v1/markets/${marketId}/candles`).pipe(
    HttpClientRequest.setUrlParams({ "interval": options.params["interval"] as any, "from": options.params["from"] as any, "to": options.params["to"] as any }),
    onRequest(options.config)(["2xx"], {"401":"MarketsControllerGetCandles401","429":"MarketsControllerGetCandles429"})
  ),
    "MarketsControllerGetMarketById": (marketId, options) => HttpClientRequest.get(`/v1/markets/${marketId}`).pipe(
    onRequest(options?.config)(["2xx"], {"401":"MarketsControllerGetMarketById401","429":"MarketsControllerGetMarketById429"})
  ),
    "PortfolioControllerGetPositions": (options) => HttpClientRequest.post(`/v1/positions`).pipe(
    HttpClientRequest.bodyJsonUnsafe(options.payload),
    onRequest(options.config)(["2xx"], {"401":"PortfolioControllerGetPositions401","429":"PortfolioControllerGetPositions429"})
  ),
    "PortfolioControllerGetOrders": (options) => HttpClientRequest.post(`/v1/orders`).pipe(
    HttpClientRequest.bodyJsonUnsafe(options.payload),
    onRequest(options.config)(["2xx"], {"401":"PortfolioControllerGetOrders401","429":"PortfolioControllerGetOrders429"})
  ),
    "PortfolioControllerGetBalances": (options) => HttpClientRequest.post(`/v1/balances`).pipe(
    HttpClientRequest.bodyJsonUnsafe(options.payload),
    onRequest(options.config)(["2xx"], {"401":"PortfolioControllerGetBalances401","429":"PortfolioControllerGetBalances429"})
  ),
    "ActionsControllerGetActions": (options) => HttpClientRequest.get(`/v1/actions`).pipe(
    HttpClientRequest.setUrlParams({ "offset": options.params["offset"] as any, "limit": options.params["limit"] as any, "address": options.params["address"] as any, "providerId": options.params["providerId"] as any, "status": options.params["status"] as any, "statuses": options.params["statuses"] as any, "type": options.params["type"] as any, "marketId": options.params["marketId"] as any }),
    onRequest(options.config)(["2xx"], {"401":"ActionsControllerGetActions401","429":"ActionsControllerGetActions429"})
  ),
    "ActionsControllerExecuteAction": (options) => HttpClientRequest.post(`/v1/actions`).pipe(
    HttpClientRequest.bodyJsonUnsafe(options.payload),
    onRequest(options.config)(["2xx"], {"401":"ActionsControllerExecuteAction401","429":"ActionsControllerExecuteAction429"})
  ),
    "ActionsControllerGetAction": (id, options) => HttpClientRequest.get(`/v1/actions/${id}`).pipe(
    onRequest(options?.config)(["2xx"], {"401":"ActionsControllerGetAction401","429":"ActionsControllerGetAction429"})
  ),
    "ActivityControllerGetActivity": (options) => HttpClientRequest.get(`/v1/activity`).pipe(
    HttpClientRequest.setUrlParams({ "offset": options.params["offset"] as any, "limit": options.params["limit"] as any, "address": options.params["address"] as any, "providerId": options.params["providerId"] as any, "actionStatus": options.params["actionStatus"] as any, "actionStatuses": options.params["actionStatuses"] as any }),
    onRequest(options.config)(["2xx"], {"401":"ActivityControllerGetActivity401","429":"ActivityControllerGetActivity429"})
  ),
    "EventsControllerGetEvents": (options) => HttpClientRequest.get(`/v1/events`).pipe(
    HttpClientRequest.setUrlParams({ "offset": options.params["offset"] as any, "limit": options.params["limit"] as any, "address": options.params["address"] as any, "providerId": options.params["providerId"] as any, "eventType": options.params["eventType"] as any, "eventTypes": options.params["eventTypes"] as any, "marketId": options.params["marketId"] as any, "perpActionId": options.params["perpActionId"] as any, "providerOrderId": options.params["providerOrderId"] as any, "fromDate": options.params["fromDate"] as any, "toDate": options.params["toDate"] as any }),
    onRequest(options.config)(["2xx"], {"401":"EventsControllerGetEvents401","429":"EventsControllerGetEvents429"})
  ),
    "EventsControllerGetEvent": (id, options) => HttpClientRequest.get(`/v1/events/${id}`).pipe(
    onRequest(options?.config)(["2xx"], {"401":"EventsControllerGetEvent401","429":"EventsControllerGetEvent429"})
  ),
    "TransactionsControllerSubmitTransaction": (transactionId, options) => HttpClientRequest.post(`/v1/transactions/${transactionId}/submit`).pipe(
    HttpClientRequest.bodyJsonUnsafe(options.payload),
    onRequest(options.config)(["2xx"], {"401":"TransactionsControllerSubmitTransaction401","429":"TransactionsControllerSubmitTransaction429"})
  ),
    "HealthControllerHealth": (options) => HttpClientRequest.get(`/health`).pipe(
    onRequest(options?.config)(["2xx"])
  )
  }
}

export interface SKClient {
  readonly httpClient: HttpClient.HttpClient
  /**
* Retrieve a list of available perps trading providers with their supported actions and argument schemas.
*/
readonly "ProvidersControllerGetProviders": <Config extends OperationConfig>(options: { readonly config?: Config | undefined } | undefined) => Effect.Effect<WithOptionalResponse<ProvidersControllerGetProviders200, Config>, HttpClientError.HttpClientError | SKClientError<"ProvidersControllerGetProviders401", ProvidersControllerGetProviders401> | SKClientError<"ProvidersControllerGetProviders429", ProvidersControllerGetProviders429>>
  /**
* Retrieve detailed information about a specific perps trading provider
*/
readonly "ProvidersControllerGetProvider": <Config extends OperationConfig>(providerId: string, options: { readonly config?: Config | undefined } | undefined) => Effect.Effect<WithOptionalResponse<ProvidersControllerGetProvider200, Config>, HttpClientError.HttpClientError | SKClientError<"ProvidersControllerGetProvider401", ProvidersControllerGetProvider401> | SKClientError<"ProvidersControllerGetProvider429", ProvidersControllerGetProvider429>>
  /**
* Retrieve a paginated list of available perps markets across all supported providers and instruments.
*/
readonly "MarketsControllerGetMarkets": <Config extends OperationConfig>(options: { readonly params?: MarketsControllerGetMarketsParams | undefined; readonly config?: Config | undefined } | undefined) => Effect.Effect<WithOptionalResponse<MarketsControllerGetMarkets200, Config>, HttpClientError.HttpClientError | SKClientError<"MarketsControllerGetMarkets401", MarketsControllerGetMarkets401> | SKClientError<"MarketsControllerGetMarkets429", MarketsControllerGetMarkets429>>
  /**
* Retrieve historical OHLCV candle data for a market. Limited to 5000 candles per request.
*/
readonly "MarketsControllerGetCandles": <Config extends OperationConfig>(marketId: string, options: { readonly params: MarketsControllerGetCandlesParams; readonly config?: Config | undefined }) => Effect.Effect<WithOptionalResponse<MarketsControllerGetCandles200, Config>, HttpClientError.HttpClientError | SKClientError<"MarketsControllerGetCandles401", MarketsControllerGetCandles401> | SKClientError<"MarketsControllerGetCandles429", MarketsControllerGetCandles429>>
  /**
* Retrieve a single market by its ID, including chart display configuration.
*/
readonly "MarketsControllerGetMarketById": <Config extends OperationConfig>(marketId: string, options: { readonly config?: Config | undefined } | undefined) => Effect.Effect<WithOptionalResponse<MarketsControllerGetMarketById200, Config>, HttpClientError.HttpClientError | SKClientError<"MarketsControllerGetMarketById401", MarketsControllerGetMarketById401> | SKClientError<"MarketsControllerGetMarketById429", MarketsControllerGetMarketById429>>
  /**
* Retrieve all active positions for a wallet address on a specific perps trading provider.
*/
readonly "PortfolioControllerGetPositions": <Config extends OperationConfig>(options: { readonly payload: PortfolioControllerGetPositionsRequestJson; readonly config?: Config | undefined }) => Effect.Effect<WithOptionalResponse<PortfolioControllerGetPositions200, Config>, HttpClientError.HttpClientError | SKClientError<"PortfolioControllerGetPositions401", PortfolioControllerGetPositions401> | SKClientError<"PortfolioControllerGetPositions429", PortfolioControllerGetPositions429>>
  /**
* Retrieve all open orders for a wallet address on a specific perps trading provider.
*/
readonly "PortfolioControllerGetOrders": <Config extends OperationConfig>(options: { readonly payload: PortfolioControllerGetOrdersRequestJson; readonly config?: Config | undefined }) => Effect.Effect<WithOptionalResponse<PortfolioControllerGetOrders200, Config>, HttpClientError.HttpClientError | SKClientError<"PortfolioControllerGetOrders401", PortfolioControllerGetOrders401> | SKClientError<"PortfolioControllerGetOrders429", PortfolioControllerGetOrders429>>
  /**
* Retrieve account balance and margin information for a wallet address on a specific perps trading provider.
*/
readonly "PortfolioControllerGetBalances": <Config extends OperationConfig>(options: { readonly payload: PortfolioControllerGetBalancesRequestJson; readonly config?: Config | undefined }) => Effect.Effect<WithOptionalResponse<PortfolioControllerGetBalances200, Config>, HttpClientError.HttpClientError | SKClientError<"PortfolioControllerGetBalances401", PortfolioControllerGetBalances401> | SKClientError<"PortfolioControllerGetBalances429", PortfolioControllerGetBalances429>>
  /**
* Retrieve all actions performed by a user on a specific provider, with optional filtering by status and action type. Returns a paginated list ordered by most recent first.
*/
readonly "ActionsControllerGetActions": <Config extends OperationConfig>(options: { readonly params: ActionsControllerGetActionsParams; readonly config?: Config | undefined }) => Effect.Effect<WithOptionalResponse<ActionsControllerGetActions200, Config>, HttpClientError.HttpClientError | SKClientError<"ActionsControllerGetActions401", ActionsControllerGetActions401> | SKClientError<"ActionsControllerGetActions429", ActionsControllerGetActions429>>
  /**
* Generate unsigned transactions for a trading action (open/close positions, manage leverage, set stop loss/take profit, fund/withdraw). Returns transaction data ready to be signed by the user.
*/
readonly "ActionsControllerExecuteAction": <Config extends OperationConfig>(options: { readonly payload: ActionsControllerExecuteActionRequestJson; readonly config?: Config | undefined }) => Effect.Effect<WithOptionalResponse<ActionsControllerExecuteAction200, Config>, HttpClientError.HttpClientError | SKClientError<"ActionsControllerExecuteAction401", ActionsControllerExecuteAction401> | SKClientError<"ActionsControllerExecuteAction429", ActionsControllerExecuteAction429>>
  /**
* Retrieve detailed information about a specific action including current status, transactions, and execution details.
*/
readonly "ActionsControllerGetAction": <Config extends OperationConfig>(id: string, options: { readonly config?: Config | undefined } | undefined) => Effect.Effect<WithOptionalResponse<ActionsControllerGetAction200, Config>, HttpClientError.HttpClientError | SKClientError<"ActionsControllerGetAction401", ActionsControllerGetAction401> | SKClientError<"ActionsControllerGetAction429", ActionsControllerGetAction429>>
  /**
* Paginated chronological feed of timeline events and user actions for an address on a provider (newest first). Events use occurredAt; actions use createdAt.
*/
readonly "ActivityControllerGetActivity": <Config extends OperationConfig>(options: { readonly params: ActivityControllerGetActivityParams; readonly config?: Config | undefined }) => Effect.Effect<WithOptionalResponse<ActivityControllerGetActivity200, Config>, HttpClientError.HttpClientError | SKClientError<"ActivityControllerGetActivity401", ActivityControllerGetActivity401> | SKClientError<"ActivityControllerGetActivity429", ActivityControllerGetActivity429>>
  /**
* Retrieve async venue outcomes (fills, liquidations, SL/TP triggers) for a user on a specific provider. Returns a paginated list ordered by most recent first.
*/
readonly "EventsControllerGetEvents": <Config extends OperationConfig>(options: { readonly params: EventsControllerGetEventsParams; readonly config?: Config | undefined }) => Effect.Effect<WithOptionalResponse<EventsControllerGetEvents200, Config>, HttpClientError.HttpClientError | SKClientError<"EventsControllerGetEvents401", EventsControllerGetEvents401> | SKClientError<"EventsControllerGetEvents429", EventsControllerGetEvents429>>
  /**
* Retrieve a single perp event by its UUID.
*/
readonly "EventsControllerGetEvent": <Config extends OperationConfig>(id: string, options: { readonly config?: Config | undefined } | undefined) => Effect.Effect<WithOptionalResponse<EventsControllerGetEvent200, Config>, HttpClientError.HttpClientError | SKClientError<"EventsControllerGetEvent401", EventsControllerGetEvent401> | SKClientError<"EventsControllerGetEvent429", EventsControllerGetEvent429>>
  /**
* Submit a signed transaction to the blockchain or protocol, or record a transaction hash if already submitted. Provide either signedPayload (to have us broadcast) or transactionHash (if already submitted). The transaction must have been created via the actions endpoint.
*/
readonly "TransactionsControllerSubmitTransaction": <Config extends OperationConfig>(transactionId: string, options: { readonly payload: TransactionsControllerSubmitTransactionRequestJson; readonly config?: Config | undefined }) => Effect.Effect<WithOptionalResponse<TransactionsControllerSubmitTransaction200, Config>, HttpClientError.HttpClientError | SKClientError<"TransactionsControllerSubmitTransaction401", TransactionsControllerSubmitTransaction401> | SKClientError<"TransactionsControllerSubmitTransaction429", TransactionsControllerSubmitTransaction429>>
  /**
* Get the health status of the perps API with current timestamp
*/
readonly "HealthControllerHealth": <Config extends OperationConfig>(options: { readonly config?: Config | undefined } | undefined) => Effect.Effect<WithOptionalResponse<HealthControllerHealth200, Config>, HttpClientError.HttpClientError>
}

export interface SKClientError<Tag extends string, E> {
  readonly _tag: Tag
  readonly request: HttpClientRequest.HttpClientRequest
  readonly response: HttpClientResponse.HttpClientResponse
  readonly cause: E
}

class SKClientErrorImpl extends Data.Error<{
  _tag: string
  cause: any
  request: HttpClientRequest.HttpClientRequest
  response: HttpClientResponse.HttpClientResponse
}> {}

export const SKClientError = <Tag extends string, E>(
  tag: Tag,
  cause: E,
  response: HttpClientResponse.HttpClientResponse,
): SKClientError<Tag, E> =>
  new SKClientErrorImpl({
    _tag: tag,
    cause,
    response,
    request: response.request,
  }) as any
