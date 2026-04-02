import type * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientError from "@effect/platform/HttpClientError"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"

export interface ProviderMetadataDto {
  /**
* Provider description
*/
readonly "description": string;
  /**
* External link to the provider website
*/
readonly "externalLink": string;
  /**
* Provider logo URI
*/
readonly "logoURI": string
}

/**
* Action type executed
*/
export type PerpActionTypes = "open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "editOrder" | "fund" | "withdraw" | "approveAgent" | "approveBuilderFee" | "updateMargin" | "setTpAndSl"

export interface ProviderDto {
  /**
* Provider identifier
*/
readonly "id": string;
  /**
* Provider name
*/
readonly "name": string;
  /**
* Network the provider operates on
*/
readonly "network": string;
  /**
* Provider metadata (description, logo, links)
*/
readonly "metadata": ProviderMetadataDto;
  readonly "supportedActions": PerpActionTypes;
  /**
* Argument schemas for each supported action (JSON Schema format)
*/
readonly "argumentSchemas": Record<string, unknown>
}

export type ProvidersControllerGetProviders200 = ReadonlyArray<ProviderDto>

export interface ProvidersControllerGetProviders401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface ProvidersControllerGetProviders429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

export interface ProvidersControllerGetProvider401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface ProvidersControllerGetProvider429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

export type MarketsControllerGetMarketsParamsSortBy = "volume24h" | "markPrice" | "priceChangePercent24h"

export type MarketsControllerGetMarketsParamsOrder = "asc" | "desc"

export interface MarketsControllerGetMarketsParams {
  readonly "offset"?: number | undefined;
  readonly "limit"?: number | undefined;
  readonly "providerId"?: string | undefined;
  readonly "sortBy"?: MarketsControllerGetMarketsParamsSortBy | undefined;
  readonly "order"?: MarketsControllerGetMarketsParamsOrder | undefined
}

/**
* Network identifier
*/
export type Networks = "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "aptos" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid"

export interface TokenDto {
  /**
* Token symbol
*/
readonly "symbol": string;
  /**
* Token name
*/
readonly "name"?: string | undefined;
  readonly "network": Networks;
  /**
* Token decimals
*/
readonly "decimals"?: number | undefined;
  /**
* Token contract address (optional for native tokens)
*/
readonly "address"?: string | undefined;
  /**
* Token logo URI
*/
readonly "logoURI"?: string | undefined
}

export interface MarketMetadataDto {
  /**
* Market name
*/
readonly "name": string;
  /**
* Market logo URI
*/
readonly "logoURI": string;
  /**
* Market URL
*/
readonly "url": string
}

export interface MarketDto {
  /**
* Market ID
*/
readonly "id": string;
  /**
* Provider ID
*/
readonly "providerId": string;
  /**
* Base asset information
*/
readonly "baseAsset": TokenDto;
  /**
* Quote asset information
*/
readonly "quoteAsset": TokenDto;
  /**
* Leverage range [min, max]
*/
readonly "leverageRange": ReadonlyArray<number>;
  /**
* Supported margin modes
*/
readonly "supportedMarginModes": ReadonlyArray<"isolated" | "cross">;
  /**
* Current mark price
*/
readonly "markPrice": number;
  /**
* Oracle/index price
*/
readonly "oraclePrice": number;
  /**
* Absolute price change in 24h
*/
readonly "priceChange24h": number;
  /**
* Percentage price change in 24h
*/
readonly "priceChangePercent24h": number;
  /**
* 24h trading volume in quote asset (e.g., USDC)
*/
readonly "volume24h": number;
  /**
* Open interest in base asset units (e.g., number of ETH coins, not USD notional)
*/
readonly "openInterest": number;
  /**
* Maker fee rate
*/
readonly "makerFee"?: string | undefined;
  /**
* Taker fee rate
*/
readonly "takerFee"?: string | undefined;
  /**
* Current funding rate
*/
readonly "fundingRate": string;
  /**
* Funding rate interval in hours
*/
readonly "fundingRateIntervalHours": number;
  /**
* Minimum position size in USD (notional) computed at the current mark price. Typically prevents rejection for being below the $10 minimum, but actual executed notional may differ due to limit/market slippage or price quantization.
*/
readonly "minSize": number;
  /**
* Market metadata
*/
readonly "metadata": MarketMetadataDto
}

export interface MarketsControllerGetMarkets200 {
  /**
* Total number of items available
*/
readonly "total": number;
  /**
* Offset of the current page
*/
readonly "offset": number;
  /**
* Limit of the current page
*/
readonly "limit": number;
  readonly "items"?: ReadonlyArray<MarketDto> | undefined
}

export interface MarketsControllerGetMarkets401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface MarketsControllerGetMarkets429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

export type MarketsControllerGetCandlesParamsInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d"

export interface MarketsControllerGetCandlesParams {
  readonly "interval": MarketsControllerGetCandlesParamsInterval;
  readonly "from": number;
  readonly "to"?: number | undefined
}

export type CandlesResponseDtoInterval = "1m" | "5m" | "15m" | "1h" | "4h" | "1d"

export interface CandleDto {
  /**
* Candle open time (unix milliseconds)
*/
readonly "openTime": number;
  /**
* Candle close time (unix milliseconds)
*/
readonly "closeTime": number;
  readonly "open": string;
  readonly "high": string;
  readonly "low": string;
  readonly "close": string;
  /**
* Volume in base asset units
*/
readonly "volume": string;
  /**
* Number of trades in this candle
*/
readonly "trades": number
}

export interface CandlesResponseDto {
  readonly "marketId": string;
  readonly "interval": CandlesResponseDtoInterval;
  readonly "candles": ReadonlyArray<CandleDto>
}

export interface MarketsControllerGetCandles401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface MarketsControllerGetCandles429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

export interface ChartConfigDto {
  /**
* Price scale (e.g., 100 for 2 decimals, 10000 for 4)
*/
readonly "pricescale": number;
  /**
* Minimum price movement (usually 1)
*/
readonly "minmov": number;
  /**
* Supported chart resolutions
*/
readonly "supportedResolutions": ReadonlyArray<string>;
  /**
* Whether intraday data is supported
*/
readonly "hasIntraday": boolean;
  /**
* Whether daily data is supported
*/
readonly "hasDaily": boolean
}

export interface MarketDetailDto {
  /**
* Market ID
*/
readonly "id": string;
  /**
* Provider ID
*/
readonly "providerId": string;
  /**
* Base asset information
*/
readonly "baseAsset": TokenDto;
  /**
* Quote asset information
*/
readonly "quoteAsset": TokenDto;
  /**
* Leverage range [min, max]
*/
readonly "leverageRange": ReadonlyArray<number>;
  /**
* Supported margin modes
*/
readonly "supportedMarginModes": ReadonlyArray<"isolated" | "cross">;
  /**
* Current mark price
*/
readonly "markPrice": number;
  /**
* Oracle/index price
*/
readonly "oraclePrice": number;
  /**
* Absolute price change in 24h
*/
readonly "priceChange24h": number;
  /**
* Percentage price change in 24h
*/
readonly "priceChangePercent24h": number;
  /**
* 24h trading volume in quote asset (e.g., USDC)
*/
readonly "volume24h": number;
  /**
* Open interest in base asset units (e.g., number of ETH coins, not USD notional)
*/
readonly "openInterest": number;
  /**
* Maker fee rate
*/
readonly "makerFee"?: string | undefined;
  /**
* Taker fee rate
*/
readonly "takerFee"?: string | undefined;
  /**
* Current funding rate
*/
readonly "fundingRate": string;
  /**
* Funding rate interval in hours
*/
readonly "fundingRateIntervalHours": number;
  /**
* Minimum position size in USD (notional) computed at the current mark price. Typically prevents rejection for being below the $10 minimum, but actual executed notional may differ due to limit/market slippage or price quantization.
*/
readonly "minSize": number;
  /**
* Market metadata
*/
readonly "metadata": MarketMetadataDto;
  /**
* Chart display configuration
*/
readonly "chartConfig": ChartConfigDto
}

export interface MarketsControllerGetMarketById401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface MarketsControllerGetMarketById429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

export interface PortfolioRequestDto {
  /**
* User wallet address
*/
readonly "address": string;
  /**
* Provider ID
*/
readonly "providerId": string
}

/**
* Order side
*/
export type PositionSide = "long" | "short"

/**
* Margin mode - isolated (dedicated collateral) or cross (shared collateral)
*/
export type MarginMode = "cross" | "isolated"

export interface TokenIdentifierDto {
  readonly "network": Networks;
  /**
* Token contract address. Leave empty for native tokens like ETH.
*/
readonly "address"?: string | undefined
}

/**
* Funding method: "bridge2" for direct Hyperliquid Bridge2 (Arbitrum USDC only), "lifi" for LiFi bridging (any token/network). If not provided, defaults to bridge2 for Arbitrum USDC and lifi for others.
*/
export type FundingMethod = "bridge2" | "lifi"

export interface ArgumentsDto {
  /**
* Market identifier
*/
readonly "marketId"?: string | undefined;
  readonly "side"?: PositionSide | undefined;
  /**
* Margin/collateral amount in USD (alternative to size). Min: $10
*/
readonly "amount"?: string | undefined;
  /**
* Position size in USD (alternative to amount). Min: $10
*/
readonly "size"?: string | undefined;
  /**
* Leverage multiplier
*/
readonly "leverage"?: number | undefined;
  readonly "marginMode"?: MarginMode | undefined;
  /**
* Limit price. If provided, order will be placed as a limit order at this price. If not provided, order executes immediately as a market order.
*/
readonly "limitPrice"?: number | undefined;
  /**
* Stop loss trigger price
*/
readonly "stopLossPrice"?: number | undefined;
  /**
* Take profit trigger price
*/
readonly "takeProfitPrice"?: number | undefined;
  /**
* Order ID (for cancelOrder, or for updating existing stopLoss/takeProfit)
*/
readonly "orderId"?: string | undefined;
  /**
* Order IDs for batch cancelOrder
*/
readonly "orderIds"?: ReadonlyArray<string> | undefined;
  /**
* Asset index (internal)
*/
readonly "assetIndex"?: number | undefined;
  /**
* Source token for cross-chain funding (bridge/swap from another chain)
*/
readonly "fromToken"?: TokenIdentifierDto | undefined;
  /**
* Agent wallet address to approve (for approveAgent action)
*/
readonly "agentAddress"?: string | undefined;
  /**
* Name for the agent wallet (for approveAgent action). If not provided, defaults to "key".
*/
readonly "agentName"?: string | undefined;
  /**
* Unix timestamp (seconds) when agent approval expires. If not provided, never expires.
*/
readonly "validUntil"?: number | undefined;
  /**
* Existing stop loss order ID (for updating via SET_TP_AND_SL bundled action)
*/
readonly "stopLossOrderId"?: string | undefined;
  /**
* Existing take profit order ID (for updating via SET_TP_AND_SL bundled action)
*/
readonly "takeProfitOrderId"?: string | undefined;
  /**
* Skip the ERC20 approval transaction.
*/
readonly "skipApproval"?: boolean | undefined;
  readonly "fundingMethod"?: FundingMethod | undefined
}

export interface PendingActionDto {
  readonly "type": PerpActionTypes;
  /**
* Action label
*/
readonly "label": string;
  /**
* Pre-filled arguments for the action
*/
readonly "args": ArgumentsDto
}

export interface PositionDto {
  /**
* Market ID
*/
readonly "marketId": string;
  readonly "side": PositionSide;
  /**
* Position size in base asset
*/
readonly "size": string;
  /**
* Entry price
*/
readonly "entryPrice": number;
  /**
* Current mark price
*/
readonly "markPrice": number;
  /**
* Leverage multiplier
*/
readonly "leverage": number;
  readonly "marginMode": MarginMode;
  /**
* Margin amount
*/
readonly "margin": number;
  /**
* Unrealized PnL from price movement
*/
readonly "unrealizedPnl": number;
  /**
* Net cumulative funding received (positive) or paid (negative) since open
*/
readonly "funding": number;
  /**
* Liquidation price
*/
readonly "liquidationPrice": number;
  /**
* Available actions for this position
*/
readonly "pendingActions": ReadonlyArray<PendingActionDto>
}

export type PortfolioControllerGetPositions200 = ReadonlyArray<PositionDto>

export interface PortfolioControllerGetPositions401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface PortfolioControllerGetPositions429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

/**
* Order type
*/
export type OrderType = "limit" | "stop_loss" | "take_profit"

export interface OrderDto {
  /**
* Market ID
*/
readonly "marketId": string;
  readonly "side": PositionSide;
  readonly "type": OrderType;
  /**
* Order size in base asset
*/
readonly "size": string;
  /**
* Limit price
*/
readonly "limitPrice"?: number | undefined;
  /**
* Trigger price
*/
readonly "triggerPrice"?: number | undefined;
  /**
* Current leverage setting for this asset, when available from the underlying venue
*/
readonly "leverage"?: number | undefined;
  /**
* Margin for this order, derived from current venue state when available. This is an estimate, not an exact exchange-reported value.
*/
readonly "margin"?: number | undefined;
  /**
* Reduce only flag
*/
readonly "reduceOnly": boolean;
  /**
* Creation timestamp
*/
readonly "createdAt": number;
  /**
* Available actions for this order
*/
readonly "pendingActions": ReadonlyArray<PendingActionDto>
}

export type PortfolioControllerGetOrders200 = ReadonlyArray<OrderDto>

export interface PortfolioControllerGetOrders401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface PortfolioControllerGetOrders429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

export interface BalanceDto {
  /**
* Provider ID
*/
readonly "providerId": string;
  /**
* Collateral token (all values denominated in this token)
*/
readonly "collateral": TokenDto;
  /**
* Total account value in collateral asset
*/
readonly "accountValue": number;
  /**
* Margin used by positions in collateral asset
*/
readonly "usedMargin": number;
  /**
* Available balance for new positions in collateral asset
*/
readonly "availableBalance": number;
  /**
* Total price PnL across all positions in collateral asset (excludes funding)
*/
readonly "unrealizedPnl": number
}

export interface PortfolioControllerGetBalances401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface PortfolioControllerGetBalances429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

/**
* Current action status
*/
export type ActionStatus = "CANCELED" | "CREATED" | "WAITING_FOR_NEXT" | "PROCESSING" | "FAILED" | "SUCCESS" | "STALE"

export interface ActionsControllerGetActionsParams {
  readonly "offset"?: number | undefined;
  readonly "limit"?: number | undefined;
  readonly "address": string;
  readonly "providerId": string;
  readonly "status"?: ActionStatus | undefined;
  readonly "statuses"?: ReadonlyArray<ActionStatus> | undefined;
  readonly "type"?: PerpActionTypes | undefined;
  readonly "marketId"?: string | undefined
}

/**
* Human-readable action label
*/
export type ActionSummaryDtoType = "Open Position" | "Close Position" | "Stop Loss" | "Take Profit" | "Set TP & SL" | "Cancel Order" | "Edit Order" | "Update Leverage" | "Update Margin" | "Fund Account" | "Withdraw" | "Approve Agent" | "Approve Builder Fee"

export type ActionSummaryDtoOrderType = "market" | "limit"

export type ActionSummaryDtoDirection = "long" | "short"

export type ActionSummaryDtoMarginMode = "cross" | "isolated"

export interface ActionSummaryDto {
  /**
* Human-readable action label
*/
readonly "type": ActionSummaryDtoType;
  readonly "assetId"?: number | undefined;
  readonly "orderType"?: ActionSummaryDtoOrderType | undefined;
  readonly "direction"?: ActionSummaryDtoDirection | undefined;
  readonly "asset"?: string | undefined;
  readonly "price"?: number | undefined;
  readonly "size"?: string | undefined;
  readonly "leverage"?: number | undefined;
  readonly "collateral"?: string | undefined;
  /**
* Fee rate as decimal string
*/
readonly "fee"?: string | undefined;
  /**
* Actual position notional value after size quantization (orderPrice × quantizedSize)
*/
readonly "orderValue"?: number | undefined;
  readonly "stopLoss"?: number | undefined;
  readonly "takeProfit"?: number | undefined;
  /**
* Update Margin: liquidation price before this margin change.
*/
readonly "oldLiquidationPrice"?: number | undefined;
  /**
* Approximation — actual value depends on exchange mechanics
*/
readonly "estimatedLiquidationPrice"?: number | undefined;
  readonly "oldStopLoss"?: number | undefined;
  readonly "oldTakeProfit"?: number | undefined;
  readonly "marginMode"?: ActionSummaryDtoMarginMode | undefined;
  readonly "orderId"?: string | undefined;
  readonly "orderIds"?: ReadonlyArray<string> | undefined;
  readonly "amount"?: string | undefined;
  readonly "fromToken"?: TokenIdentifierDto | undefined;
  readonly "method"?: string | undefined;
  readonly "agentAddress"?: string | undefined;
  readonly "agentName"?: string | undefined;
  /**
* Close position: expected close price at submission (limit price if limit close, else mark price)
*/
readonly "closedPrice"?: number | undefined;
  /**
* Close position: unrealized Pnl on the positon at submission (expected PnL if fully closing at mark)
*/
readonly "pnl"?: string | undefined;
  /**
* Close position: deposited margin for the position at submission (isolated margin only, excludes unrealized PnL)
*/
readonly "margin"?: string | undefined
}

/**
* Transaction type
*/
export type PerpTransactionType = "APPROVAL" | "OPEN_POSITION" | "CLOSE_POSITION" | "UPDATE_LEVERAGE" | "STOP_LOSS" | "TAKE_PROFIT" | "CANCEL_ORDER" | "EDIT_ORDER" | "FUND" | "WITHDRAW" | "APPROVE_BUILDER_FEE" | "ENABLE_DEX_ABSTRACTION" | "APPROVE_AGENT" | "UPDATE_MARGIN" | "SET_TP_AND_SL"

/**
* Transaction status after submission
*/
export type PerpTransactionStatus = "CREATED" | "QUEUED" | "BROADCASTED" | "CONFIRMED" | "FAILED" | "NOT_FOUND"

/**
* Signing format required
*/
export type SigningFormat = "EVM_TRANSACTION" | "EIP712_TYPED_DATA" | "SOLANA_TRANSACTION" | "COSMOS_TRANSACTION"

export interface TransactionDto {
  /**
* Transaction ID for API tracking (UUID)
*/
readonly "id": string;
  readonly "network": Networks;
  /**
* Chain ID
*/
readonly "chainId": string;
  readonly "type": PerpTransactionType;
  readonly "status": PerpTransactionStatus;
  /**
* User address
*/
readonly "address": string;
  /**
* Action arguments
*/
readonly "args"?: ArgumentsDto | undefined;
  readonly "signingFormat"?: SigningFormat | undefined;
  /**
* Unsigned transaction payload to sign
*/
readonly "signablePayload"?: Record<string, unknown> | undefined;
  /**
* Raw action payload with nonce that this transaction commits to. Use it to independently recompute the EIP-712 connectionId and verify transaction integrity. Present for L1 transactions; undefined for standard EVM transactions where signablePayload is self-describing.
*/
readonly "rawPayload"?: Record<string, unknown> | undefined;
  /**
* Block explorer URL for this transaction
*/
readonly "explorerUrl"?: Record<string, unknown> | null | undefined
}

export interface ActionDto {
  /**
* Unique action identifier (UUID)
*/
readonly "id": string;
  /**
* Provider identifier
*/
readonly "providerId": string;
  readonly "action": PerpActionTypes;
  readonly "status": ActionStatus;
  /**
* Human-readable breakdown of what this action does
*/
readonly "summary": ActionSummaryDto | null;
  /**
* TLV-encoded, secp256k1-signed metadata.
* 
* Hex string of concatenated TLV fields. Each field: Tag (1 byte) + Length (1 byte) + Value (N bytes). Tags > 0x7f use a 3-byte header: 0x81 prefix + Tag (1 byte) + Length (1 byte).
* 
* Fields in order: STRUCTURE_TYPE (0x01), VERSION (0x02), ACTION_TYPE (0x81 0xd0, u8: order=0x00 modify=0x01 cancel=0x02 updateLeverage=0x03 close=0x04 updateIsolatedMargin=0x05), ASSET_ID (0x81 0xd1, uint32 BE), ASSET_TICKER (0x24, UTF-8), NETWORK_TYPE (0x81 0xd2), BUILDER_ADDRESS (0x81 0xd3, 20 bytes, optional), MARGIN (0x81 0xd4, u64 big-endian, USD value with 6 decimal precision, e.g. 87500000 = $87.50, optional), LEVERAGE (0x81 0xd5, u32 big-endian, optional), SIGNATURE (0x15, DER-encoded secp256k1 over SHA-256 of preceding bytes).
*/
readonly "signedMetadata"?: Record<string, unknown> | undefined;
  /**
* Unsigned transactions to sign and submit
*/
readonly "transactions": ReadonlyArray<TransactionDto>;
  /**
* When the action was created
*/
readonly "createdAt": string;
  /**
* When the action completed (null if still in progress)
*/
readonly "completedAt": string | null
}

export interface ActionsControllerGetActions200 {
  /**
* Total number of items available
*/
readonly "total": number;
  /**
* Offset of the current page
*/
readonly "offset": number;
  /**
* Limit of the current page
*/
readonly "limit": number;
  readonly "items"?: ReadonlyArray<ActionDto> | undefined
}

export interface ActionsControllerGetActions401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface ActionsControllerGetActions429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

export interface ActionRequestDto {
  /**
* Provider identifier
*/
readonly "providerId": string;
  /**
* User wallet address
*/
readonly "address": string;
  readonly "action": PerpActionTypes;
  /**
* Action arguments (validated via Zod in chains)
*/
readonly "args": ArgumentsDto
}

export interface ActionsControllerExecuteAction401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface ActionsControllerExecuteAction429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

export interface ActionsControllerGetAction401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface ActionsControllerGetAction429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

export interface SubmitTransactionDto {
  /**
* Signed transaction payload (hex string or signed EIP-712 data). Required if transactionHash is not provided.
*/
readonly "signedPayload"?: string | undefined;
  /**
* Transaction hash if already submitted by the user. Required if signedPayload is not provided.
*/
readonly "transactionHash"?: string | undefined
}

export interface SubmitTransactionResponseDto {
  /**
* Transaction hash or order ID (undefined for immediate actions)
*/
readonly "transactionHash"?: string | undefined;
  /**
* Link to view transaction on provider platform
*/
readonly "link": string;
  readonly "status": PerpTransactionStatus;
  /**
* Error message if status is FAILED
*/
readonly "error"?: string | undefined;
  /**
* Additional provider-specific details
*/
readonly "details"?: Record<string, unknown> | undefined
}

export interface TransactionsControllerSubmitTransaction401 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined
}

export interface TransactionsControllerSubmitTransaction429 {
  readonly "message"?: string | undefined;
  readonly "error"?: string | undefined;
  readonly "statusCode"?: number | undefined;
  readonly "retryAfter"?: number | undefined
}

/**
* The health status of the service
*/
export type HealthStatus = "OK" | "FAIL"

export interface HealthStatusDto {
  readonly "status": HealthStatus;
  /**
* Timestamp when the health check was performed
*/
readonly "timestamp": string
}

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
          new HttpClientError.ResponseError({
            request: response.request,
            response,
            reason: "StatusCode",
            description: typeof description === "string" ? description : JSON.stringify(description),
          }),
        ),
    )
  const withResponse: <A, E>(
    f: (response: HttpClientResponse.HttpClientResponse) => Effect.Effect<A, E>,
  ) => (
    request: HttpClientRequest.HttpClientRequest,
  ) => Effect.Effect<any, any> = options.transformClient
    ? (f) => (request) =>
        Effect.flatMap(
          Effect.flatMap(options.transformClient!(httpClient), (client) =>
            client.execute(request),
          ),
          f,
        )
    : (f) => (request) => Effect.flatMap(httpClient.execute(request), f)
  const decodeSuccess = <A>(response: HttpClientResponse.HttpClientResponse) =>
    response.json as Effect.Effect<A, HttpClientError.ResponseError>
  const decodeVoid = (_response: HttpClientResponse.HttpClientResponse) =>
    Effect.void
  const decodeError =
    <Tag extends string, E>(tag: Tag) =>
    (
      response: HttpClientResponse.HttpClientResponse,
    ): Effect.Effect<
      never,
      SKClientError<Tag, E> | HttpClientError.ResponseError
    > =>
      Effect.flatMap(
        response.json as Effect.Effect<E, HttpClientError.ResponseError>,
        (cause) => Effect.fail(SKClientError(tag, cause, response)),
      )
  const onRequest = (
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
    return withResponse(HttpClientResponse.matchStatus(cases) as any)
  }
  return {
    httpClient,
    "ProvidersControllerGetProviders": () => HttpClientRequest.get(`/v1/providers`).pipe(
    onRequest(["2xx"], {"401":"ProvidersControllerGetProviders401","429":"ProvidersControllerGetProviders429"})
  ),
  "ProvidersControllerGetProvider": (providerId) => HttpClientRequest.get(`/v1/providers/${providerId}`).pipe(
    onRequest(["2xx"], {"401":"ProvidersControllerGetProvider401","429":"ProvidersControllerGetProvider429"})
  ),
  "MarketsControllerGetMarkets": (options) => HttpClientRequest.get(`/v1/markets`).pipe(
    HttpClientRequest.setUrlParams({ "offset": options?.["offset"] as any, "limit": options?.["limit"] as any, "providerId": options?.["providerId"] as any, "sortBy": options?.["sortBy"] as any, "order": options?.["order"] as any }),
    onRequest(["2xx"], {"401":"MarketsControllerGetMarkets401","429":"MarketsControllerGetMarkets429"})
  ),
  "MarketsControllerGetCandles": (marketId, options) => HttpClientRequest.get(`/v1/markets/${marketId}/candles`).pipe(
    HttpClientRequest.setUrlParams({ "interval": options?.["interval"] as any, "from": options?.["from"] as any, "to": options?.["to"] as any }),
    onRequest(["2xx"], {"401":"MarketsControllerGetCandles401","429":"MarketsControllerGetCandles429"})
  ),
  "MarketsControllerGetMarketById": (marketId) => HttpClientRequest.get(`/v1/markets/${marketId}`).pipe(
    onRequest(["2xx"], {"401":"MarketsControllerGetMarketById401","429":"MarketsControllerGetMarketById429"})
  ),
  "PortfolioControllerGetPositions": (options) => HttpClientRequest.post(`/v1/positions`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    onRequest(["2xx"], {"401":"PortfolioControllerGetPositions401","429":"PortfolioControllerGetPositions429"})
  ),
  "PortfolioControllerGetOrders": (options) => HttpClientRequest.post(`/v1/orders`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    onRequest(["2xx"], {"401":"PortfolioControllerGetOrders401","429":"PortfolioControllerGetOrders429"})
  ),
  "PortfolioControllerGetBalances": (options) => HttpClientRequest.post(`/v1/balances`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    onRequest(["2xx"], {"401":"PortfolioControllerGetBalances401","429":"PortfolioControllerGetBalances429"})
  ),
  "ActionsControllerGetActions": (options) => HttpClientRequest.get(`/v1/actions`).pipe(
    HttpClientRequest.setUrlParams({ "offset": options?.["offset"] as any, "limit": options?.["limit"] as any, "address": options?.["address"] as any, "providerId": options?.["providerId"] as any, "status": options?.["status"] as any, "statuses": options?.["statuses"] as any, "type": options?.["type"] as any, "marketId": options?.["marketId"] as any }),
    onRequest(["2xx"], {"401":"ActionsControllerGetActions401","429":"ActionsControllerGetActions429"})
  ),
  "ActionsControllerExecuteAction": (options) => HttpClientRequest.post(`/v1/actions`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    onRequest(["2xx"], {"401":"ActionsControllerExecuteAction401","429":"ActionsControllerExecuteAction429"})
  ),
  "ActionsControllerGetAction": (id) => HttpClientRequest.get(`/v1/actions/${id}`).pipe(
    onRequest(["2xx"], {"401":"ActionsControllerGetAction401","429":"ActionsControllerGetAction429"})
  ),
  "TransactionsControllerSubmitTransaction": (transactionId, options) => HttpClientRequest.post(`/v1/transactions/${transactionId}/submit`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    onRequest(["2xx"], {"401":"TransactionsControllerSubmitTransaction401","429":"TransactionsControllerSubmitTransaction429"})
  ),
  "HealthControllerHealth": () => HttpClientRequest.get(`/health`).pipe(
    onRequest(["2xx"])
  )
  }
}

export interface SKClient {
  readonly httpClient: HttpClient.HttpClient
  /**
* Retrieve a list of available perps trading providers with their supported actions and argument schemas.
*/
readonly "ProvidersControllerGetProviders": () => Effect.Effect<ProvidersControllerGetProviders200, HttpClientError.HttpClientError | SKClientError<"ProvidersControllerGetProviders401", ProvidersControllerGetProviders401> | SKClientError<"ProvidersControllerGetProviders429", ProvidersControllerGetProviders429>>
  /**
* Retrieve detailed information about a specific perps trading provider
*/
readonly "ProvidersControllerGetProvider": (providerId: string) => Effect.Effect<ProviderDto, HttpClientError.HttpClientError | SKClientError<"ProvidersControllerGetProvider401", ProvidersControllerGetProvider401> | SKClientError<"ProvidersControllerGetProvider429", ProvidersControllerGetProvider429>>
  /**
* Retrieve a paginated list of available perps markets across all supported providers and instruments.
*/
readonly "MarketsControllerGetMarkets": (options?: MarketsControllerGetMarketsParams | undefined) => Effect.Effect<MarketsControllerGetMarkets200, HttpClientError.HttpClientError | SKClientError<"MarketsControllerGetMarkets401", MarketsControllerGetMarkets401> | SKClientError<"MarketsControllerGetMarkets429", MarketsControllerGetMarkets429>>
  /**
* Retrieve historical OHLCV candle data for a market. Limited to 5000 candles per request.
*/
readonly "MarketsControllerGetCandles": (marketId: string, options: MarketsControllerGetCandlesParams) => Effect.Effect<CandlesResponseDto, HttpClientError.HttpClientError | SKClientError<"MarketsControllerGetCandles401", MarketsControllerGetCandles401> | SKClientError<"MarketsControllerGetCandles429", MarketsControllerGetCandles429>>
  /**
* Retrieve a single market by its ID, including chart display configuration.
*/
readonly "MarketsControllerGetMarketById": (marketId: string) => Effect.Effect<MarketDetailDto, HttpClientError.HttpClientError | SKClientError<"MarketsControllerGetMarketById401", MarketsControllerGetMarketById401> | SKClientError<"MarketsControllerGetMarketById429", MarketsControllerGetMarketById429>>
  /**
* Retrieve all active positions for a wallet address on a specific perps trading provider.
*/
readonly "PortfolioControllerGetPositions": (options: PortfolioRequestDto) => Effect.Effect<PortfolioControllerGetPositions200, HttpClientError.HttpClientError | SKClientError<"PortfolioControllerGetPositions401", PortfolioControllerGetPositions401> | SKClientError<"PortfolioControllerGetPositions429", PortfolioControllerGetPositions429>>
  /**
* Retrieve all open orders for a wallet address on a specific perps trading provider.
*/
readonly "PortfolioControllerGetOrders": (options: PortfolioRequestDto) => Effect.Effect<PortfolioControllerGetOrders200, HttpClientError.HttpClientError | SKClientError<"PortfolioControllerGetOrders401", PortfolioControllerGetOrders401> | SKClientError<"PortfolioControllerGetOrders429", PortfolioControllerGetOrders429>>
  /**
* Retrieve account balance and margin information for a wallet address on a specific perps trading provider.
*/
readonly "PortfolioControllerGetBalances": (options: PortfolioRequestDto) => Effect.Effect<BalanceDto, HttpClientError.HttpClientError | SKClientError<"PortfolioControllerGetBalances401", PortfolioControllerGetBalances401> | SKClientError<"PortfolioControllerGetBalances429", PortfolioControllerGetBalances429>>
  /**
* Retrieve all actions performed by a user on a specific provider, with optional filtering by status and action type. Returns a paginated list ordered by most recent first.
*/
readonly "ActionsControllerGetActions": (options: ActionsControllerGetActionsParams) => Effect.Effect<ActionsControllerGetActions200, HttpClientError.HttpClientError | SKClientError<"ActionsControllerGetActions401", ActionsControllerGetActions401> | SKClientError<"ActionsControllerGetActions429", ActionsControllerGetActions429>>
  /**
* Generate unsigned transactions for a trading action (open/close positions, manage leverage, set stop loss/take profit, fund/withdraw). Returns transaction data ready to be signed by the user.
*/
readonly "ActionsControllerExecuteAction": (options: ActionRequestDto) => Effect.Effect<ActionDto, HttpClientError.HttpClientError | SKClientError<"ActionsControllerExecuteAction401", ActionsControllerExecuteAction401> | SKClientError<"ActionsControllerExecuteAction429", ActionsControllerExecuteAction429>>
  /**
* Retrieve detailed information about a specific action including current status, transactions, and execution details.
*/
readonly "ActionsControllerGetAction": (id: string) => Effect.Effect<ActionDto, HttpClientError.HttpClientError | SKClientError<"ActionsControllerGetAction401", ActionsControllerGetAction401> | SKClientError<"ActionsControllerGetAction429", ActionsControllerGetAction429>>
  /**
* Submit a signed transaction to the blockchain or protocol, or record a transaction hash if already submitted. Provide either signedPayload (to have us broadcast) or transactionHash (if already submitted). The transaction must have been created via the actions endpoint.
*/
readonly "TransactionsControllerSubmitTransaction": (transactionId: string, options: SubmitTransactionDto) => Effect.Effect<SubmitTransactionResponseDto, HttpClientError.HttpClientError | SKClientError<"TransactionsControllerSubmitTransaction401", TransactionsControllerSubmitTransaction401> | SKClientError<"TransactionsControllerSubmitTransaction429", TransactionsControllerSubmitTransaction429>>
  /**
* Get the health status of the perps API with current timestamp
*/
readonly "HealthControllerHealth": () => Effect.Effect<HealthStatusDto, HttpClientError.HttpClientError>
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
