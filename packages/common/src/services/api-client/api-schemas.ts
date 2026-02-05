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
  /**
* Supported action types
*/
"supportedActions": S.Array(S.Literal("open", "close", "updateLeverage", "stopLoss", "takeProfit", "cancelOrder", "fund", "withdraw", "approveAgent")),
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

export class MarketsControllerGetMarketsParams extends S.Struct({
  "offset": S.optionalWith(S.Number.pipe(S.greaterThanOrEqualTo(0)), { nullable: true, default: () => 0 as const }),
  "limit": S.optionalWith(S.Number.pipe(S.greaterThanOrEqualTo(1), S.lessThanOrEqualTo(500)), { nullable: true, default: () => 100 as const }),
  "providerId": S.optionalWith(S.String, { nullable: true })
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
* Open interest - total notional value of all open positions
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
* Position side
*/
export class PositionDtoSide extends S.Literal("long", "short") {}

/**
* Margin mode
*/
export class PositionDtoMarginMode extends S.Literal("cross", "isolated") {}

/**
* Action type
*/
export class PendingActionDtoType extends S.Literal("open", "close", "updateLeverage", "stopLoss", "takeProfit", "cancelOrder", "fund", "withdraw", "approveAgent") {}

/**
* Position side - long (buy) or short (sell)
*/
export class ArgumentsDtoSide extends S.Literal("long", "short") {}

/**
* Margin mode - isolated (dedicated collateral) or cross (shared collateral)
*/
export class ArgumentsDtoMarginMode extends S.Literal("cross", "isolated") {}

export class TokenIdentifierDto extends S.Class<TokenIdentifierDto>("TokenIdentifierDto")({
  "network": Networks,
  /**
* Token contract address. Leave empty for native tokens like ETH.
*/
"address": S.optionalWith(S.String, { nullable: true })
}) {}

export class ArgumentsDto extends S.Class<ArgumentsDto>("ArgumentsDto")({
  /**
* Market identifier
*/
"marketId": S.optionalWith(S.String, { nullable: true }),
  /**
* Position side - long (buy) or short (sell)
*/
"side": S.optionalWith(ArgumentsDtoSide, { nullable: true }),
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
  /**
* Margin mode - isolated (dedicated collateral) or cross (shared collateral)
*/
"marginMode": S.optionalWith(ArgumentsDtoMarginMode, { nullable: true }),
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
"validUntil": S.optionalWith(S.Number, { nullable: true })
}) {}

export class PendingActionDto extends S.Class<PendingActionDto>("PendingActionDto")({
  /**
* Action type
*/
"type": PendingActionDtoType,
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
  /**
* Position side
*/
"side": PositionDtoSide,
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
  /**
* Margin mode
*/
"marginMode": PositionDtoMarginMode,
  /**
* Margin amount
*/
"margin": S.Number,
  /**
* Unrealized PnL
*/
"unrealizedPnl": S.Number,
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
* Order side
*/
export class OrderDtoSide extends S.Literal("long", "short") {}

/**
* Order type
*/
export class OrderDtoType extends S.Literal("limit", "stop_loss", "take_profit") {}

export class OrderDto extends S.Class<OrderDto>("OrderDto")({
  /**
* Market ID
*/
"marketId": S.String,
  /**
* Order side
*/
"side": OrderDtoSide,
  /**
* Order type
*/
"type": OrderDtoType,
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
* Total unrealized PnL across all positions in collateral asset
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
* Action to execute
*/
export class ActionRequestDtoAction extends S.Literal("open", "close", "updateLeverage", "stopLoss", "takeProfit", "cancelOrder", "fund", "withdraw", "approveAgent") {}

export class ActionRequestDto extends S.Class<ActionRequestDto>("ActionRequestDto")({
  /**
* Provider identifier
*/
"providerId": S.String,
  /**
* User wallet address
*/
"address": S.String,
  /**
* Action to execute
*/
"action": ActionRequestDtoAction,
  /**
* Action arguments (validated via Zod in chains)
*/
"args": ArgumentsDto
}) {}

/**
* Action type executed
*/
export class ActionDtoAction extends S.Literal("open", "close", "updateLeverage", "stopLoss", "takeProfit", "cancelOrder", "fund", "withdraw", "approveAgent") {}

/**
* Current action status
*/
export class ActionDtoStatus extends S.Literal("CANCELED", "CREATED", "WAITING_FOR_NEXT", "PROCESSING", "FAILED", "SUCCESS", "STALE") {}

/**
* Transaction type
*/
export class TransactionDtoType extends S.Literal("APPROVAL", "OPEN_POSITION", "CLOSE_POSITION", "UPDATE_LEVERAGE", "STOP_LOSS", "TAKE_PROFIT", "CANCEL_ORDER", "FUND", "WITHDRAW", "APPROVE_BUILDER_FEE", "ENABLE_DEX_ABSTRACTION", "APPROVE_AGENT") {}

/**
* Current transaction status
*/
export class TransactionDtoStatus extends S.Literal("CREATED", "SIGNED", "BROADCASTED", "CONFIRMED", "FAILED", "NOT_FOUND") {}

/**
* Signing format required
*/
export class TransactionDtoSigningFormat extends S.Literal("EVM_TRANSACTION", "EIP712_TYPED_DATA", "SOLANA_TRANSACTION", "COSMOS_TRANSACTION") {}

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
  /**
* Transaction type
*/
"type": TransactionDtoType,
  /**
* Current transaction status
*/
"status": TransactionDtoStatus,
  /**
* User address
*/
"address": S.String,
  /**
* Action arguments
*/
"args": S.optionalWith(ArgumentsDto, { nullable: true }),
  /**
* Signing format required
*/
"signingFormat": S.optionalWith(TransactionDtoSigningFormat, { nullable: true }),
  /**
* Unsigned transaction payload to sign
*/
"signablePayload": S.optionalWith(S.Record({ key: S.String, value: S.Unknown }), { nullable: true })
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
  /**
* Action type executed
*/
"action": ActionDtoAction,
  /**
* Current action status
*/
"status": ActionDtoStatus,
  /**
* Unsigned transactions to sign and submit
*/
"transactions": S.Array(TransactionDto)
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

/**
* Transaction status after submission
*/
export class SubmitTransactionResponseDtoStatus extends S.Literal("CREATED", "SIGNED", "BROADCASTED", "CONFIRMED", "FAILED", "NOT_FOUND") {}

export class SubmitTransactionResponseDto extends S.Class<SubmitTransactionResponseDto>("SubmitTransactionResponseDto")({
  /**
* Transaction hash or order ID (undefined for immediate actions)
*/
"transactionHash": S.optionalWith(S.String, { nullable: true }),
  /**
* Link to view transaction on provider platform
*/
"link": S.String,
  /**
* Transaction status after submission
*/
"status": SubmitTransactionResponseDtoStatus,
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
    HttpClientRequest.setUrlParams({ "offset": options?.["offset"] as any, "limit": options?.["limit"] as any, "providerId": options?.["providerId"] as any }),
    withResponse(HttpClientResponse.matchStatus({
      "2xx": decodeSuccess(MarketsControllerGetMarkets200),
      "401": decodeError("MarketsControllerGetMarkets401", MarketsControllerGetMarkets401),
      "429": decodeError("MarketsControllerGetMarkets429", MarketsControllerGetMarkets429),
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
