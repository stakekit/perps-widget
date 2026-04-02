import type * as HttpClient from "@effect/platform/HttpClient"
import * as HttpClientError from "@effect/platform/HttpClientError"
import * as HttpClientRequest from "@effect/platform/HttpClientRequest"
import * as HttpClientResponse from "@effect/platform/HttpClientResponse"
import * as Data from "effect/Data"
import * as Effect from "effect/Effect"
import type { ParseError } from "effect/ParseResult"
import * as S from "effect/Schema"

export class ProviderMetadataDto extends S.Class<ProviderMetadataDto>("ProviderMetadataDto")({
  /**
* Provider description
*/
"description": S.String,
  /**
* External link to the provider website
*/
"externalLink": S.String,
  /**
* Provider logo URI
*/
"logoURI": S.String
}) {}

/**
* Action type executed
*/
export class PerpActionTypes extends S.Literal("open", "close", "updateLeverage", "stopLoss", "takeProfit", "cancelOrder", "editOrder", "fund", "withdraw", "approveAgent", "approveBuilderFee", "updateMargin", "setTpAndSl") {}

export class ProviderDto extends S.Class<ProviderDto>("ProviderDto")({
  /**
* Provider identifier
*/
"id": S.String,
  /**
* Provider name
*/
"name": S.String,
  /**
* Network the provider operates on
*/
"network": S.String,
  /**
* Provider metadata (description, logo, links)
*/
"metadata": ProviderMetadataDto,
  "supportedActions": PerpActionTypes,
  /**
* Argument schemas for each supported action (JSON Schema format)
*/
"argumentSchemas": S.Record({ key: S.String, value: S.Unknown })
}) {}

export class ProvidersControllerGetProviders200 extends S.Array(ProviderDto) {}

export class ProvidersControllerGetProviders401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class ProvidersControllerGetProviders429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

export class ProvidersControllerGetProvider401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class ProvidersControllerGetProvider429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

export class MarketsControllerGetMarketsParamsSortBy extends S.Literal("volume24h", "markPrice", "priceChangePercent24h") {}

export class MarketsControllerGetMarketsParamsOrder extends S.Literal("asc", "desc") {}

export class MarketsControllerGetMarketsParams extends S.Struct({
  "offset": S.optionalWith(S.Number.pipe(S.greaterThanOrEqualTo(0)), { nullable: true, default: () => 0 as const }),
  "limit": S.optionalWith(S.Number.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(500)), { nullable: true, default: () => 100 as const }),
  "providerId": S.optionalWith(S.String, { nullable: true }),
  "sortBy": S.optionalWith(MarketsControllerGetMarketsParamsSortBy, { nullable: true }),
  "order": S.optionalWith(MarketsControllerGetMarketsParamsOrder, { nullable: true })
}) {}

/**
* Network identifier
*/
export class Networks extends S.Literal("ethereum", "ethereum-goerli", "ethereum-holesky", "ethereum-sepolia", "ethereum-hoodi", "arbitrum", "base", "base-sepolia", "gnosis", "optimism", "polygon", "polygon-amoy", "starknet", "zksync", "linea", "unichain", "monad-testnet", "monad", "avalanche-c", "avalanche-c-atomic", "avalanche-p", "binance", "celo", "fantom", "harmony", "moonriver", "okc", "viction", "core", "sonic", "plasma", "katana", "hyperevm", "agoric", "akash", "axelar", "band-protocol", "bitsong", "canto", "chihuahua", "comdex", "coreum", "cosmos", "crescent", "cronos", "cudos", "desmos", "dydx", "evmos", "fetch-ai", "gravity-bridge", "injective", "irisnet", "juno", "kava", "ki-network", "mars-protocol", "nym", "okex-chain", "onomy", "osmosis", "persistence", "quicksilver", "regen", "secret", "sentinel", "sommelier", "stafi", "stargaze", "stride", "teritori", "tgrade", "umee", "sei", "mantra", "celestia", "saga", "zetachain", "dymension", "humansai", "neutron", "polkadot", "kusama", "westend", "bittensor", "aptos", "binancebeacon", "cardano", "near", "solana", "solana-devnet", "stellar", "stellar-testnet", "sui", "tezos", "tron", "ton", "ton-testnet", "hyperliquid") {}

export class TokenDto extends S.Class<TokenDto>("TokenDto")({
  /**
* Token symbol
*/
"symbol": S.String,
  /**
* Token name
*/
"name": S.optionalWith(S.String, { nullable: true }),
  "network": Networks,
  /**
* Token decimals
*/
"decimals": S.optionalWith(S.Number, { nullable: true }),
  /**
* Token contract address (optional for native tokens)
*/
"address": S.optionalWith(S.String, { nullable: true }),
  /**
* Token logo URI
*/
"logoURI": S.optionalWith(S.String, { nullable: true })
}) {}

export class MarketMetadataDto extends S.Class<MarketMetadataDto>("MarketMetadataDto")({
  /**
* Market name
*/
"name": S.String,
  /**
* Market logo URI
*/
"logoURI": S.String,
  /**
* Market URL
*/
"url": S.String
}) {}

export class MarketDto extends S.Class<MarketDto>("MarketDto")({
  /**
* Market ID
*/
"id": S.String,
  /**
* Provider ID
*/
"providerId": S.String,
  /**
* Base asset information
*/
"baseAsset": TokenDto,
  /**
* Quote asset information
*/
"quoteAsset": TokenDto,
  /**
* Leverage range [min, max]
*/
"leverageRange": S.Array(S.Number),
  /**
* Supported margin modes
*/
"supportedMarginModes": S.Array(S.Literal("isolated", "cross")),
  /**
* Current mark price
*/
"markPrice": S.Number,
  /**
* Oracle/index price
*/
"oraclePrice": S.Number,
  /**
* Absolute price change in 24h
*/
"priceChange24h": S.Number,
  /**
* Percentage price change in 24h
*/
"priceChangePercent24h": S.Number,
  /**
* 24h trading volume in quote asset (e.g., USDC)
*/
"volume24h": S.Number,
  /**
* Open interest in base asset units (e.g., number of ETH coins, not USD notional)
*/
"openInterest": S.Number,
  /**
* Maker fee rate
*/
"makerFee": S.optionalWith(S.String, { nullable: true }),
  /**
* Taker fee rate
*/
"takerFee": S.optionalWith(S.String, { nullable: true }),
  /**
* Current funding rate
*/
"fundingRate": S.String,
  /**
* Funding rate interval in hours
*/
"fundingRateIntervalHours": S.Number,
  /**
* Minimum position size in USD (notional) computed at the current mark price. Typically prevents rejection for being below the $10 minimum, but actual executed notional may differ due to limit/market slippage or price quantization.
*/
"minSize": S.Number,
  /**
* Market metadata
*/
"metadata": MarketMetadataDto
}) {}

export class MarketsControllerGetMarkets200 extends S.Struct({
  /**
* Total number of items available
*/
"total": S.Number,
  /**
* Offset of the current page
*/
"offset": S.Number,
  /**
* Limit of the current page
*/
"limit": S.Number,
  "items": S.optionalWith(S.Array(MarketDto), { nullable: true })
}) {}

export class MarketsControllerGetMarkets401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class MarketsControllerGetMarkets429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

export class MarketsControllerGetCandlesParamsInterval extends S.Literal("1m", "5m", "15m", "1h", "4h", "1d") {}

export class MarketsControllerGetCandlesParams extends S.Struct({
  "interval": MarketsControllerGetCandlesParamsInterval,
  "from": S.Number,
  "to": S.optionalWith(S.Number, { nullable: true })
}) {}

export class CandlesResponseDtoInterval extends S.Literal("1m", "5m", "15m", "1h", "4h", "1d") {}

export class CandleDto extends S.Class<CandleDto>("CandleDto")({
  /**
* Candle open time (unix milliseconds)
*/
"openTime": S.Number,
  /**
* Candle close time (unix milliseconds)
*/
"closeTime": S.Number,
  "open": S.String,
  "high": S.String,
  "low": S.String,
  "close": S.String,
  /**
* Volume in base asset units
*/
"volume": S.String,
  /**
* Number of trades in this candle
*/
"trades": S.Number
}) {}

export class CandlesResponseDto extends S.Class<CandlesResponseDto>("CandlesResponseDto")({
  "marketId": S.String,
  "interval": CandlesResponseDtoInterval,
  "candles": S.Array(CandleDto)
}) {}

export class MarketsControllerGetCandles401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class MarketsControllerGetCandles429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

export class ChartConfigDto extends S.Class<ChartConfigDto>("ChartConfigDto")({
  /**
* Price scale (e.g., 100 for 2 decimals, 10000 for 4)
*/
"pricescale": S.Number,
  /**
* Minimum price movement (usually 1)
*/
"minmov": S.Number,
  /**
* Supported chart resolutions
*/
"supportedResolutions": S.Array(S.String),
  /**
* Whether intraday data is supported
*/
"hasIntraday": S.Boolean,
  /**
* Whether daily data is supported
*/
"hasDaily": S.Boolean
}) {}

export class MarketDetailDto extends S.Class<MarketDetailDto>("MarketDetailDto")({
  /**
* Market ID
*/
"id": S.String,
  /**
* Provider ID
*/
"providerId": S.String,
  /**
* Base asset information
*/
"baseAsset": TokenDto,
  /**
* Quote asset information
*/
"quoteAsset": TokenDto,
  /**
* Leverage range [min, max]
*/
"leverageRange": S.Array(S.Number),
  /**
* Supported margin modes
*/
"supportedMarginModes": S.Array(S.Literal("isolated", "cross")),
  /**
* Current mark price
*/
"markPrice": S.Number,
  /**
* Oracle/index price
*/
"oraclePrice": S.Number,
  /**
* Absolute price change in 24h
*/
"priceChange24h": S.Number,
  /**
* Percentage price change in 24h
*/
"priceChangePercent24h": S.Number,
  /**
* 24h trading volume in quote asset (e.g., USDC)
*/
"volume24h": S.Number,
  /**
* Open interest in base asset units (e.g., number of ETH coins, not USD notional)
*/
"openInterest": S.Number,
  /**
* Maker fee rate
*/
"makerFee": S.optionalWith(S.String, { nullable: true }),
  /**
* Taker fee rate
*/
"takerFee": S.optionalWith(S.String, { nullable: true }),
  /**
* Current funding rate
*/
"fundingRate": S.String,
  /**
* Funding rate interval in hours
*/
"fundingRateIntervalHours": S.Number,
  /**
* Minimum position size in USD (notional) computed at the current mark price. Typically prevents rejection for being below the $10 minimum, but actual executed notional may differ due to limit/market slippage or price quantization.
*/
"minSize": S.Number,
  /**
* Market metadata
*/
"metadata": MarketMetadataDto,
  /**
* Chart display configuration
*/
"chartConfig": ChartConfigDto
}) {}

export class MarketsControllerGetMarketById401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class MarketsControllerGetMarketById429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

export class PortfolioRequestDto extends S.Class<PortfolioRequestDto>("PortfolioRequestDto")({
  /**
* User wallet address
*/
"address": S.String,
  /**
* Provider ID
*/
"providerId": S.String
}) {}

/**
* Order side
*/
export class PositionSide extends S.Literal("long", "short") {}

/**
* Margin mode - isolated (dedicated collateral) or cross (shared collateral)
*/
export class MarginMode extends S.Literal("cross", "isolated") {}

export class TokenIdentifierDto extends S.Class<TokenIdentifierDto>("TokenIdentifierDto")({
  "network": Networks,
  /**
* Token contract address. Leave empty for native tokens like ETH.
*/
"address": S.optionalWith(S.String, { nullable: true })
}) {}

/**
* Funding method: "bridge2" for direct Hyperliquid Bridge2 (Arbitrum USDC only), "lifi" for LiFi bridging (any token/network). If not provided, defaults to bridge2 for Arbitrum USDC and lifi for others.
*/
export class FundingMethod extends S.Literal("bridge2", "lifi") {}

export class ArgumentsDto extends S.Class<ArgumentsDto>("ArgumentsDto")({
  /**
* Market identifier
*/
"marketId": S.optionalWith(S.String, { nullable: true }),
  "side": S.optionalWith(PositionSide, { nullable: true }),
  /**
* Margin/collateral amount in USD (alternative to size). Min: $10
*/
"amount": S.optionalWith(S.String, { nullable: true }),
  /**
* Position size in USD (alternative to amount). Min: $10
*/
"size": S.optionalWith(S.String, { nullable: true }),
  /**
* Leverage multiplier
*/
"leverage": S.optionalWith(S.Number, { nullable: true }),
  "marginMode": S.optionalWith(MarginMode, { nullable: true }),
  /**
* Limit price. If provided, order will be placed as a limit order at this price. If not provided, order executes immediately as a market order.
*/
"limitPrice": S.optionalWith(S.Number, { nullable: true }),
  /**
* Stop loss trigger price
*/
"stopLossPrice": S.optionalWith(S.Number, { nullable: true }),
  /**
* Take profit trigger price
*/
"takeProfitPrice": S.optionalWith(S.Number, { nullable: true }),
  /**
* Order ID (for cancelOrder, or for updating existing stopLoss/takeProfit)
*/
"orderId": S.optionalWith(S.String, { nullable: true }),
  /**
* Order IDs for batch cancelOrder
*/
"orderIds": S.optionalWith(S.Array(S.String), { nullable: true }),
  /**
* Asset index (internal)
*/
"assetIndex": S.optionalWith(S.Number, { nullable: true }),
  /**
* Source token for cross-chain funding (bridge/swap from another chain)
*/
"fromToken": S.optionalWith(TokenIdentifierDto, { nullable: true }),
  /**
* Agent wallet address to approve (for approveAgent action)
*/
"agentAddress": S.optionalWith(S.String, { nullable: true }),
  /**
* Name for the agent wallet (for approveAgent action). If not provided, defaults to "key".
*/
"agentName": S.optionalWith(S.String, { nullable: true }),
  /**
* Unix timestamp (seconds) when agent approval expires. If not provided, never expires.
*/
"validUntil": S.optionalWith(S.Number, { nullable: true }),
  /**
* Existing stop loss order ID (for updating via SET_TP_AND_SL bundled action)
*/
"stopLossOrderId": S.optionalWith(S.String, { nullable: true }),
  /**
* Existing take profit order ID (for updating via SET_TP_AND_SL bundled action)
*/
"takeProfitOrderId": S.optionalWith(S.String, { nullable: true }),
  /**
* Skip the ERC20 approval transaction.
*/
"skipApproval": S.optionalWith(S.Boolean, { nullable: true }),
  "fundingMethod": S.optionalWith(FundingMethod, { nullable: true })
}) {}

export class PendingActionDto extends S.Class<PendingActionDto>("PendingActionDto")({
  "type": PerpActionTypes,
  /**
* Action label
*/
"label": S.String,
  /**
* Pre-filled arguments for the action
*/
"args": ArgumentsDto
}) {}

export class PositionDto extends S.Class<PositionDto>("PositionDto")({
  /**
* Market ID
*/
"marketId": S.String,
  "side": PositionSide,
  /**
* Position size in base asset
*/
"size": S.String,
  /**
* Entry price
*/
"entryPrice": S.Number,
  /**
* Current mark price
*/
"markPrice": S.Number,
  /**
* Leverage multiplier
*/
"leverage": S.Number,
  "marginMode": MarginMode,
  /**
* Margin amount
*/
"margin": S.Number,
  /**
* Unrealized PnL from price movement
*/
"unrealizedPnl": S.Number,
  /**
* Net cumulative funding received (positive) or paid (negative) since open
*/
"funding": S.Number,
  /**
* Liquidation price
*/
"liquidationPrice": S.Number,
  /**
* Available actions for this position
*/
"pendingActions": S.Array(PendingActionDto)
}) {}

export class PortfolioControllerGetPositions200 extends S.Array(PositionDto) {}

export class PortfolioControllerGetPositions401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class PortfolioControllerGetPositions429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

/**
* Order type
*/
export class OrderType extends S.Literal("limit", "stop_loss", "take_profit") {}

export class OrderDto extends S.Class<OrderDto>("OrderDto")({
  /**
* Market ID
*/
"marketId": S.String,
  "side": PositionSide,
  "type": OrderType,
  /**
* Order size in base asset
*/
"size": S.String,
  /**
* Limit price
*/
"limitPrice": S.optionalWith(S.Number, { nullable: true }),
  /**
* Trigger price
*/
"triggerPrice": S.optionalWith(S.Number, { nullable: true }),
  /**
* Current leverage setting for this asset, when available from the underlying venue
*/
"leverage": S.optionalWith(S.Number, { nullable: true }),
  /**
* Margin for this order, derived from current venue state when available. This is an estimate, not an exact exchange-reported value.
*/
"margin": S.optionalWith(S.Number, { nullable: true }),
  /**
* Reduce only flag
*/
"reduceOnly": S.Boolean,
  /**
* Creation timestamp
*/
"createdAt": S.Number,
  /**
* Available actions for this order
*/
"pendingActions": S.Array(PendingActionDto)
}) {}

export class PortfolioControllerGetOrders200 extends S.Array(OrderDto) {}

export class PortfolioControllerGetOrders401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class PortfolioControllerGetOrders429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

export class BalanceDto extends S.Class<BalanceDto>("BalanceDto")({
  /**
* Provider ID
*/
"providerId": S.String,
  /**
* Collateral token (all values denominated in this token)
*/
"collateral": TokenDto,
  /**
* Total account value in collateral asset
*/
"accountValue": S.Number,
  /**
* Margin used by positions in collateral asset
*/
"usedMargin": S.Number,
  /**
* Available balance for new positions in collateral asset
*/
"availableBalance": S.Number,
  /**
* Total price PnL across all positions in collateral asset (excludes funding)
*/
"unrealizedPnl": S.Number
}) {}

export class PortfolioControllerGetBalances401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class PortfolioControllerGetBalances429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

/**
* Current action status
*/
export class ActionStatus extends S.Literal("CANCELED", "CREATED", "WAITING_FOR_NEXT", "PROCESSING", "FAILED", "SUCCESS", "STALE") {}

export class ActionsControllerGetActionsParams extends S.Struct({
  "offset": S.optionalWith(S.Number.pipe(S.greaterThanOrEqualTo(0)), { nullable: true, default: () => 0 as const }),
  "limit": S.optionalWith(S.Number.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(500)), { nullable: true, default: () => 100 as const }),
  "address": S.String,
  "providerId": S.String,
  "status": S.optionalWith(ActionStatus, { nullable: true }),
  "statuses": S.optionalWith(S.Array(ActionStatus), { nullable: true }),
  "type": S.optionalWith(PerpActionTypes, { nullable: true }),
  "marketId": S.optionalWith(S.String, { nullable: true })
}) {}

/**
* Human-readable action label
*/
export class ActionSummaryDtoType extends S.Literal("Open Position", "Close Position", "Stop Loss", "Take Profit", "Set TP & SL", "Cancel Order", "Edit Order", "Update Leverage", "Update Margin", "Fund Account", "Withdraw", "Approve Agent", "Approve Builder Fee") {}

export class ActionSummaryDtoOrderType extends S.Literal("market", "limit") {}

export class ActionSummaryDtoDirection extends S.Literal("long", "short") {}

export class ActionSummaryDtoMarginMode extends S.Literal("cross", "isolated") {}

export class ActionSummaryDto extends S.Class<ActionSummaryDto>("ActionSummaryDto")({
  /**
* Human-readable action label
*/
"type": ActionSummaryDtoType,
  "assetId": S.optionalWith(S.Number, { nullable: true }),
  "orderType": S.optionalWith(ActionSummaryDtoOrderType, { nullable: true }),
  "direction": S.optionalWith(ActionSummaryDtoDirection, { nullable: true }),
  "asset": S.optionalWith(S.String, { nullable: true }),
  "price": S.optionalWith(S.Number, { nullable: true }),
  "size": S.optionalWith(S.String, { nullable: true }),
  "leverage": S.optionalWith(S.Number, { nullable: true }),
  "collateral": S.optionalWith(S.String, { nullable: true }),
  /**
* Fee rate as decimal string
*/
"fee": S.optionalWith(S.String, { nullable: true }),
  /**
* Actual position notional value after size quantization (orderPrice × quantizedSize)
*/
"orderValue": S.optionalWith(S.Number, { nullable: true }),
  "stopLoss": S.optionalWith(S.Number, { nullable: true }),
  "takeProfit": S.optionalWith(S.Number, { nullable: true }),
  /**
* Update Margin: liquidation price before this margin change.
*/
"oldLiquidationPrice": S.optionalWith(S.Number, { nullable: true }),
  /**
* Approximation — actual value depends on exchange mechanics
*/
"estimatedLiquidationPrice": S.optionalWith(S.Number, { nullable: true }),
  "oldStopLoss": S.optionalWith(S.Number, { nullable: true }),
  "oldTakeProfit": S.optionalWith(S.Number, { nullable: true }),
  "marginMode": S.optionalWith(ActionSummaryDtoMarginMode, { nullable: true }),
  "orderId": S.optionalWith(S.String, { nullable: true }),
  "orderIds": S.optionalWith(S.Array(S.String), { nullable: true }),
  "amount": S.optionalWith(S.String, { nullable: true }),
  "fromToken": S.optionalWith(TokenIdentifierDto, { nullable: true }),
  "method": S.optionalWith(S.String, { nullable: true }),
  "agentAddress": S.optionalWith(S.String, { nullable: true }),
  "agentName": S.optionalWith(S.String, { nullable: true }),
  /**
* Close position: expected close price at submission (limit price if limit close, else mark price)
*/
"closedPrice": S.optionalWith(S.Number, { nullable: true }),
  /**
* Close position: unrealized Pnl on the positon at submission (expected PnL if fully closing at mark)
*/
"pnl": S.optionalWith(S.String, { nullable: true }),
  /**
* Close position: deposited margin for the position at submission (isolated margin only, excludes unrealized PnL)
*/
"margin": S.optionalWith(S.String, { nullable: true })
}) {}

/**
* Transaction type
*/
export class PerpTransactionType extends S.Literal("APPROVAL", "OPEN_POSITION", "CLOSE_POSITION", "UPDATE_LEVERAGE", "STOP_LOSS", "TAKE_PROFIT", "CANCEL_ORDER", "EDIT_ORDER", "FUND", "WITHDRAW", "APPROVE_BUILDER_FEE", "ENABLE_DEX_ABSTRACTION", "APPROVE_AGENT", "UPDATE_MARGIN", "SET_TP_AND_SL") {}

/**
* Transaction status after submission
*/
export class PerpTransactionStatus extends S.Literal("CREATED", "QUEUED", "BROADCASTED", "CONFIRMED", "FAILED", "NOT_FOUND") {}

/**
* Signing format required
*/
export class SigningFormat extends S.Literal("EVM_TRANSACTION", "EIP712_TYPED_DATA", "SOLANA_TRANSACTION", "COSMOS_TRANSACTION") {}

export class TransactionDto extends S.Class<TransactionDto>("TransactionDto")({
  /**
* Transaction ID for API tracking (UUID)
*/
"id": S.String,
  "network": Networks,
  /**
* Chain ID
*/
"chainId": S.String,
  "type": PerpTransactionType,
  "status": PerpTransactionStatus,
  /**
* User address
*/
"address": S.String,
  /**
* Action arguments
*/
"args": S.optionalWith(ArgumentsDto, { nullable: true }),
  "signingFormat": S.optionalWith(SigningFormat, { nullable: true }),
  /**
* Unsigned transaction payload to sign
*/
"signablePayload": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* Raw action payload with nonce that this transaction commits to. Use it to independently recompute the EIP-712 connectionId and verify transaction integrity. Present for L1 transactions; undefined for standard EVM transactions where signablePayload is self-describing.
*/
"rawPayload": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* Block explorer URL for this transaction
*/
"explorerUrl": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true })
}) {}

export class ActionDto extends S.Class<ActionDto>("ActionDto")({
  /**
* Unique action identifier (UUID)
*/
"id": S.String,
  /**
* Provider identifier
*/
"providerId": S.String,
  "action": PerpActionTypes,
  "status": ActionStatus,
  /**
* Human-readable breakdown of what this action does
*/
"summary": S.NullOr(ActionSummaryDto),
  /**
* TLV-encoded, secp256k1-signed metadata.
* 
* Hex string of concatenated TLV fields. Each field: Tag (1 byte) + Length (1 byte) + Value (N bytes). Tags > 0x7f use a 3-byte header: 0x81 prefix + Tag (1 byte) + Length (1 byte).
* 
* Fields in order: STRUCTURE_TYPE (0x01), VERSION (0x02), ACTION_TYPE (0x81 0xd0, u8: order=0x00 modify=0x01 cancel=0x02 updateLeverage=0x03 close=0x04 updateIsolatedMargin=0x05), ASSET_ID (0x81 0xd1, uint32 BE), ASSET_TICKER (0x24, UTF-8), NETWORK_TYPE (0x81 0xd2), BUILDER_ADDRESS (0x81 0xd3, 20 bytes, optional), MARGIN (0x81 0xd4, u64 big-endian, USD value with 6 decimal precision, e.g. 87500000 = $87.50, optional), LEVERAGE (0x81 0xd5, u32 big-endian, optional), SIGNATURE (0x15, DER-encoded secp256k1 over SHA-256 of preceding bytes).
*/
"signedMetadata": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true }),
  /**
* Unsigned transactions to sign and submit
*/
"transactions": S.Array(TransactionDto),
  /**
* When the action was created
*/
"createdAt": S.String,
  /**
* When the action completed (null if still in progress)
*/
"completedAt": S.NullOr(S.String)
}) {}

export class ActionsControllerGetActions200 extends S.Struct({
  /**
* Total number of items available
*/
"total": S.Number,
  /**
* Offset of the current page
*/
"offset": S.Number,
  /**
* Limit of the current page
*/
"limit": S.Number,
  "items": S.optionalWith(S.Array(ActionDto), { nullable: true })
}) {}

export class ActionsControllerGetActions401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class ActionsControllerGetActions429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

export class ActionRequestDto extends S.Class<ActionRequestDto>("ActionRequestDto")({
  /**
* Provider identifier
*/
"providerId": S.String,
  /**
* User wallet address
*/
"address": S.String,
  "action": PerpActionTypes,
  /**
* Action arguments (validated via Zod in chains)
*/
"args": ArgumentsDto
}) {}

export class ActionsControllerExecuteAction401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class ActionsControllerExecuteAction429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

export class ActionsControllerGetAction401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class ActionsControllerGetAction429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

export class SubmitTransactionDto extends S.Class<SubmitTransactionDto>("SubmitTransactionDto")({
  /**
* Signed transaction payload (hex string or signed EIP-712 data). Required if transactionHash is not provided.
*/
"signedPayload": S.optionalWith(S.String, { nullable: true }),
  /**
* Transaction hash if already submitted by the user. Required if signedPayload is not provided.
*/
"transactionHash": S.optionalWith(S.String, { nullable: true })
}) {}

export class SubmitTransactionResponseDto extends S.Class<SubmitTransactionResponseDto>("SubmitTransactionResponseDto")({
  /**
* Transaction hash or order ID (undefined for immediate actions)
*/
"transactionHash": S.optionalWith(S.String, { nullable: true }),
  /**
* Link to view transaction on provider platform
*/
"link": S.String,
  "status": PerpTransactionStatus,
  /**
* Error message if status is FAILED
*/
"error": S.optionalWith(S.String, { nullable: true }),
  /**
* Additional provider-specific details
*/
"details": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true })
}) {}

export class TransactionsControllerSubmitTransaction401 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true })
}) {}

export class TransactionsControllerSubmitTransaction429 extends S.Struct({
  "message": S.optionalWith(S.String, { nullable: true }),
  "error": S.optionalWith(S.String, { nullable: true }),
  "statusCode": S.optionalWith(S.Number, { nullable: true }),
  "retryAfter": S.optionalWith(S.Number, { nullable: true })
}) {}

/**
* The health status of the service
*/
export class HealthStatus extends S.Literal("OK", "FAIL") {}

export class HealthStatusDto extends S.Class<HealthStatusDto>("HealthStatusDto")({
  "status": HealthStatus,
  /**
* Timestamp when the health check was performed
*/
"timestamp": S.String
}) {}

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
  const decodeSuccess =
    <A, I, R>(schema: S.Schema<A, I, R>) =>
    (response: HttpClientResponse.HttpClientResponse) =>
      HttpClientResponse.schemaBodyJson(schema)(response)
  const decodeError =
    <const Tag extends string, A, I, R>(tag: Tag, schema: S.Schema<A, I, R>) =>
    (response: HttpClientResponse.HttpClientResponse) =>
      Effect.flatMap(
        HttpClientResponse.schemaBodyJson(schema)(response),
        (cause) => Effect.fail(SKClientError(tag, cause, response)),
      )
  return {
    httpClient,
    "ProvidersControllerGetProviders": () => HttpClientRequest.get(`/v1/providers`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(ProvidersControllerGetProviders200),
      "401": decodeError("ProvidersControllerGetProviders401", ProvidersControllerGetProviders401),
      "429": decodeError("ProvidersControllerGetProviders429", ProvidersControllerGetProviders429),
      orElse: unexpectedStatus
    }))
  ),
  "ProvidersControllerGetProvider": (providerId) => HttpClientRequest.get(`/v1/providers/${providerId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(ProviderDto),
      "401": decodeError("ProvidersControllerGetProvider401", ProvidersControllerGetProvider401),
      "429": decodeError("ProvidersControllerGetProvider429", ProvidersControllerGetProvider429),
      "404": () => Effect.void,
      orElse: unexpectedStatus
    }))
  ),
  "MarketsControllerGetMarkets": (options) => HttpClientRequest.get(`/v1/markets`).pipe(
    HttpClientRequest.setUrlParams({ "offset": options?.["offset"] as any, "limit": options?.["limit"] as any, "providerId": options?.["providerId"] as any, "sortBy": options?.["sortBy"] as any, "order": options?.["order"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(MarketsControllerGetMarkets200),
      "401": decodeError("MarketsControllerGetMarkets401", MarketsControllerGetMarkets401),
      "429": decodeError("MarketsControllerGetMarkets429", MarketsControllerGetMarkets429),
      orElse: unexpectedStatus
    }))
  ),
  "MarketsControllerGetCandles": (marketId, options) => HttpClientRequest.get(`/v1/markets/${marketId}/candles`).pipe(
    HttpClientRequest.setUrlParams({ "interval": options?.["interval"] as any, "from": options?.["from"] as any, "to": options?.["to"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(CandlesResponseDto),
      "401": decodeError("MarketsControllerGetCandles401", MarketsControllerGetCandles401),
      "429": decodeError("MarketsControllerGetCandles429", MarketsControllerGetCandles429),
      "400": () => Effect.void,
      orElse: unexpectedStatus
    }))
  ),
  "MarketsControllerGetMarketById": (marketId) => HttpClientRequest.get(`/v1/markets/${marketId}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(MarketDetailDto),
      "401": decodeError("MarketsControllerGetMarketById401", MarketsControllerGetMarketById401),
      "429": decodeError("MarketsControllerGetMarketById429", MarketsControllerGetMarketById429),
      "404": () => Effect.void,
      orElse: unexpectedStatus
    }))
  ),
  "PortfolioControllerGetPositions": (options) => HttpClientRequest.post(`/v1/positions`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(PortfolioControllerGetPositions200),
      "401": decodeError("PortfolioControllerGetPositions401", PortfolioControllerGetPositions401),
      "429": decodeError("PortfolioControllerGetPositions429", PortfolioControllerGetPositions429),
      orElse: unexpectedStatus
    }))
  ),
  "PortfolioControllerGetOrders": (options) => HttpClientRequest.post(`/v1/orders`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(PortfolioControllerGetOrders200),
      "401": decodeError("PortfolioControllerGetOrders401", PortfolioControllerGetOrders401),
      "429": decodeError("PortfolioControllerGetOrders429", PortfolioControllerGetOrders429),
      orElse: unexpectedStatus
    }))
  ),
  "PortfolioControllerGetBalances": (options) => HttpClientRequest.post(`/v1/balances`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(BalanceDto),
      "401": decodeError("PortfolioControllerGetBalances401", PortfolioControllerGetBalances401),
      "429": decodeError("PortfolioControllerGetBalances429", PortfolioControllerGetBalances429),
      orElse: unexpectedStatus
    }))
  ),
  "ActionsControllerGetActions": (options) => HttpClientRequest.get(`/v1/actions`).pipe(
    HttpClientRequest.setUrlParams({ "offset": options?.["offset"] as any, "limit": options?.["limit"] as any, "address": options?.["address"] as any, "providerId": options?.["providerId"] as any, "status": options?.["status"] as any, "statuses": options?.["statuses"] as any, "type": options?.["type"] as any, "marketId": options?.["marketId"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(ActionsControllerGetActions200),
      "401": decodeError("ActionsControllerGetActions401", ActionsControllerGetActions401),
      "429": decodeError("ActionsControllerGetActions429", ActionsControllerGetActions429),
      orElse: unexpectedStatus
    }))
  ),
  "ActionsControllerExecuteAction": (options) => HttpClientRequest.post(`/v1/actions`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(ActionDto),
      "401": decodeError("ActionsControllerExecuteAction401", ActionsControllerExecuteAction401),
      "429": decodeError("ActionsControllerExecuteAction429", ActionsControllerExecuteAction429),
      orElse: unexpectedStatus
    }))
  ),
  "ActionsControllerGetAction": (id) => HttpClientRequest.get(`/v1/actions/${id}`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(ActionDto),
      "401": decodeError("ActionsControllerGetAction401", ActionsControllerGetAction401),
      "429": decodeError("ActionsControllerGetAction429", ActionsControllerGetAction429),
      "404": () => Effect.void,
      orElse: unexpectedStatus
    }))
  ),
  "TransactionsControllerSubmitTransaction": (transactionId, options) => HttpClientRequest.post(`/v1/transactions/${transactionId}/submit`).pipe(
    HttpClientRequest.bodyUnsafeJson(options),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(SubmitTransactionResponseDto),
      "401": decodeError("TransactionsControllerSubmitTransaction401", TransactionsControllerSubmitTransaction401),
      "429": decodeError("TransactionsControllerSubmitTransaction429", TransactionsControllerSubmitTransaction429),
      "403": () => Effect.void,
      "404": () => Effect.void,
      orElse: unexpectedStatus
    }))
  ),
  "HealthControllerHealth": () => HttpClientRequest.get(`/health`).pipe(
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(HealthStatusDto),
      orElse: unexpectedStatus
    }))
  )
  }
}

export interface SKClient {
  readonly httpClient: HttpClient.HttpClient
  /**
* Retrieve a list of available perps trading providers with their supported actions and argument schemas.
*/
readonly "ProvidersControllerGetProviders": () => Effect.Effect<typeof ProvidersControllerGetProviders200.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"ProvidersControllerGetProviders401", typeof ProvidersControllerGetProviders401.Type> | SKClientError<"ProvidersControllerGetProviders429", typeof ProvidersControllerGetProviders429.Type>>
  /**
* Retrieve detailed information about a specific perps trading provider
*/
readonly "ProvidersControllerGetProvider": (providerId: string) => Effect.Effect<typeof ProviderDto.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"ProvidersControllerGetProvider401", typeof ProvidersControllerGetProvider401.Type> | SKClientError<"ProvidersControllerGetProvider429", typeof ProvidersControllerGetProvider429.Type>>
  /**
* Retrieve a paginated list of available perps markets across all supported providers and instruments.
*/
readonly "MarketsControllerGetMarkets": (options?: typeof MarketsControllerGetMarketsParams.Encoded | undefined) => Effect.Effect<typeof MarketsControllerGetMarkets200.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"MarketsControllerGetMarkets401", typeof MarketsControllerGetMarkets401.Type> | SKClientError<"MarketsControllerGetMarkets429", typeof MarketsControllerGetMarkets429.Type>>
  /**
* Retrieve historical OHLCV candle data for a market. Limited to 5000 candles per request.
*/
readonly "MarketsControllerGetCandles": (marketId: string, options: typeof MarketsControllerGetCandlesParams.Encoded) => Effect.Effect<typeof CandlesResponseDto.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"MarketsControllerGetCandles401", typeof MarketsControllerGetCandles401.Type> | SKClientError<"MarketsControllerGetCandles429", typeof MarketsControllerGetCandles429.Type>>
  /**
* Retrieve a single market by its ID, including chart display configuration.
*/
readonly "MarketsControllerGetMarketById": (marketId: string) => Effect.Effect<typeof MarketDetailDto.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"MarketsControllerGetMarketById401", typeof MarketsControllerGetMarketById401.Type> | SKClientError<"MarketsControllerGetMarketById429", typeof MarketsControllerGetMarketById429.Type>>
  /**
* Retrieve all active positions for a wallet address on a specific perps trading provider.
*/
readonly "PortfolioControllerGetPositions": (options: typeof PortfolioRequestDto.Encoded) => Effect.Effect<typeof PortfolioControllerGetPositions200.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"PortfolioControllerGetPositions401", typeof PortfolioControllerGetPositions401.Type> | SKClientError<"PortfolioControllerGetPositions429", typeof PortfolioControllerGetPositions429.Type>>
  /**
* Retrieve all open orders for a wallet address on a specific perps trading provider.
*/
readonly "PortfolioControllerGetOrders": (options: typeof PortfolioRequestDto.Encoded) => Effect.Effect<typeof PortfolioControllerGetOrders200.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"PortfolioControllerGetOrders401", typeof PortfolioControllerGetOrders401.Type> | SKClientError<"PortfolioControllerGetOrders429", typeof PortfolioControllerGetOrders429.Type>>
  /**
* Retrieve account balance and margin information for a wallet address on a specific perps trading provider.
*/
readonly "PortfolioControllerGetBalances": (options: typeof PortfolioRequestDto.Encoded) => Effect.Effect<typeof BalanceDto.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"PortfolioControllerGetBalances401", typeof PortfolioControllerGetBalances401.Type> | SKClientError<"PortfolioControllerGetBalances429", typeof PortfolioControllerGetBalances429.Type>>
  /**
* Retrieve all actions performed by a user on a specific provider, with optional filtering by status and action type. Returns a paginated list ordered by most recent first.
*/
readonly "ActionsControllerGetActions": (options: typeof ActionsControllerGetActionsParams.Encoded) => Effect.Effect<typeof ActionsControllerGetActions200.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"ActionsControllerGetActions401", typeof ActionsControllerGetActions401.Type> | SKClientError<"ActionsControllerGetActions429", typeof ActionsControllerGetActions429.Type>>
  /**
* Generate unsigned transactions for a trading action (open/close positions, manage leverage, set stop loss/take profit, fund/withdraw). Returns transaction data ready to be signed by the user.
*/
readonly "ActionsControllerExecuteAction": (options: typeof ActionRequestDto.Encoded) => Effect.Effect<typeof ActionDto.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"ActionsControllerExecuteAction401", typeof ActionsControllerExecuteAction401.Type> | SKClientError<"ActionsControllerExecuteAction429", typeof ActionsControllerExecuteAction429.Type>>
  /**
* Retrieve detailed information about a specific action including current status, transactions, and execution details.
*/
readonly "ActionsControllerGetAction": (id: string) => Effect.Effect<typeof ActionDto.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"ActionsControllerGetAction401", typeof ActionsControllerGetAction401.Type> | SKClientError<"ActionsControllerGetAction429", typeof ActionsControllerGetAction429.Type>>
  /**
* Submit a signed transaction to the blockchain or protocol, or record a transaction hash if already submitted. Provide either signedPayload (to have us broadcast) or transactionHash (if already submitted). The transaction must have been created via the actions endpoint.
*/
readonly "TransactionsControllerSubmitTransaction": (transactionId: string, options: typeof SubmitTransactionDto.Encoded) => Effect.Effect<typeof SubmitTransactionResponseDto.Type, HttpClientError.HttpClientError | ParseError | SKClientError<"TransactionsControllerSubmitTransaction401", typeof TransactionsControllerSubmitTransaction401.Type> | SKClientError<"TransactionsControllerSubmitTransaction429", typeof TransactionsControllerSubmitTransaction429.Type>>
  /**
* Get the health status of the perps API with current timestamp
*/
readonly "HealthControllerHealth": () => Effect.Effect<typeof HealthStatusDto.Type, HttpClientError.HttpClientError | ParseError>
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
