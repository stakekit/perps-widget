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
  /**
* Supported action types
*/
readonly "supportedActions": ReadonlyArray<"open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "fund" | "withdraw">;
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

export interface MarketsControllerGetMarketsParams {
  readonly "offset"?: number | undefined;
  readonly "limit"?: number | undefined;
  readonly "providerId"?: string | undefined
}

/**
* Network identifier
*/
export type Networks = "ethereum" | "ethereum-goerli" | "ethereum-holesky" | "ethereum-sepolia" | "ethereum-hoodi" | "arbitrum" | "base" | "base-sepolia" | "gnosis" | "optimism" | "polygon" | "polygon-amoy" | "starknet" | "zksync" | "linea" | "unichain" | "monad-testnet" | "monad" | "avalanche-c" | "avalanche-c-atomic" | "avalanche-p" | "binance" | "celo" | "fantom" | "harmony" | "moonriver" | "okc" | "viction" | "core" | "sonic" | "plasma" | "katana" | "hyperevm" | "agoric" | "akash" | "axelar" | "band-protocol" | "bitsong" | "canto" | "chihuahua" | "comdex" | "coreum" | "cosmos" | "crescent" | "cronos" | "cudos" | "desmos" | "dydx" | "evmos" | "fetch-ai" | "gravity-bridge" | "injective" | "irisnet" | "juno" | "kava" | "ki-network" | "mars-protocol" | "nym" | "okex-chain" | "onomy" | "osmosis" | "persistence" | "quicksilver" | "regen" | "secret" | "sentinel" | "sommelier" | "stafi" | "stargaze" | "stride" | "teritori" | "tgrade" | "umee" | "sei" | "mantra" | "celestia" | "saga" | "zetachain" | "dymension" | "humansai" | "neutron" | "polkadot" | "kusama" | "westend" | "bittensor" | "binancebeacon" | "cardano" | "near" | "solana" | "solana-devnet" | "stellar" | "stellar-testnet" | "sui" | "tezos" | "tron" | "ton" | "ton-testnet" | "hyperliquid"

export interface TokenDto {
  readonly "name": string;
  readonly "network": Networks;
  readonly "symbol": string;
  readonly "decimals": number;
  readonly "address"?: string | undefined;
  readonly "coinGeckoId"?: string | undefined;
  readonly "logoURI"?: string | undefined;
  readonly "isPoints"?: boolean | undefined;
  readonly "feeConfigurationId"?: string | undefined
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
* Open interest - total notional value of all open positions
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
* Position side
*/
export type PositionDtoSide = "long" | "short"

/**
* Margin mode
*/
export type PositionDtoMarginMode = "cross" | "isolated"

/**
* Action type
*/
export type PendingActionDtoType = "open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "fund" | "withdraw"

/**
* Position side - long (buy) or short (sell)
*/
export type ArgumentsDtoSide = "long" | "short"

/**
* Margin mode - isolated (dedicated collateral) or cross (shared collateral)
*/
export type ArgumentsDtoMarginMode = "cross" | "isolated"

export interface TokenIdentifierDto {
  readonly "network": Networks;
  /**
* Token contract address. Leave empty for native tokens like ETH.
*/
readonly "address"?: string | undefined
}

export interface ArgumentsDto {
  /**
* Market identifier
*/
readonly "marketId"?: string | undefined;
  /**
* Position side - long (buy) or short (sell)
*/
readonly "side"?: ArgumentsDtoSide | undefined;
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
  /**
* Margin mode - isolated (dedicated collateral) or cross (shared collateral)
*/
readonly "marginMode"?: ArgumentsDtoMarginMode | undefined;
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
* Asset index (internal)
*/
readonly "assetIndex"?: number | undefined;
  /**
* Source token for cross-chain funding (bridge/swap from another chain)
*/
readonly "fromToken"?: TokenIdentifierDto | undefined
}

export interface PendingActionDto {
  /**
* Action type
*/
readonly "type": PendingActionDtoType;
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
  /**
* Position side
*/
readonly "side": PositionDtoSide;
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
  /**
* Margin mode
*/
readonly "marginMode": PositionDtoMarginMode;
  /**
* Margin amount
*/
readonly "margin": number;
  /**
* Unrealized PnL
*/
readonly "unrealizedPnl": number;
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
* Order side
*/
export type OrderDtoSide = "long" | "short"

/**
* Order type
*/
export type OrderDtoType = "limit" | "stop_loss" | "take_profit"

export interface OrderDto {
  /**
* Market ID
*/
readonly "marketId": string;
  /**
* Order side
*/
readonly "side": OrderDtoSide;
  /**
* Order type
*/
readonly "type": OrderDtoType;
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
* Total unrealized PnL across all positions in collateral asset
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
* Action to execute
*/
export type ActionRequestDtoAction = "open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "fund" | "withdraw"

export interface ActionRequestDto {
  /**
* Provider identifier
*/
readonly "providerId": string;
  /**
* User wallet address
*/
readonly "address": string;
  /**
* Action to execute
*/
readonly "action": ActionRequestDtoAction;
  /**
* Action arguments (validated via Zod in chains)
*/
readonly "args": ArgumentsDto
}

/**
* Action type executed
*/
export type ActionDtoAction = "open" | "close" | "updateLeverage" | "stopLoss" | "takeProfit" | "cancelOrder" | "fund" | "withdraw"

/**
* Current action status
*/
export type ActionDtoStatus = "CANCELED" | "CREATED" | "WAITING_FOR_NEXT" | "PROCESSING" | "FAILED" | "SUCCESS" | "STALE"

/**
* Transaction type
*/
export type TransactionDtoType = "APPROVAL" | "OPEN_POSITION" | "CLOSE_POSITION" | "UPDATE_LEVERAGE" | "STOP_LOSS" | "TAKE_PROFIT" | "CANCEL_ORDER" | "FUND" | "WITHDRAW"

/**
* Current transaction status
*/
export type TransactionDtoStatus = "CREATED" | "SIGNED" | "BROADCASTED" | "CONFIRMED" | "FAILED" | "NOT_FOUND"

/**
* Signing format required
*/
export type TransactionDtoSigningFormat = "EVM_TRANSACTION" | "EIP712_TYPED_DATA" | "SOLANA_TRANSACTION" | "COSMOS_TRANSACTION"

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
  /**
* Transaction type
*/
readonly "type": TransactionDtoType;
  /**
* Current transaction status
*/
readonly "status": TransactionDtoStatus;
  /**
* User address
*/
readonly "address": string;
  /**
* Action arguments
*/
readonly "args"?: ArgumentsDto | undefined;
  /**
* Signing format required
*/
readonly "signingFormat"?: TransactionDtoSigningFormat | undefined;
  /**
* Unsigned transaction payload to sign
*/
readonly "signablePayload"?: Record<string, unknown> | undefined
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
  /**
* Action type executed
*/
readonly "action": ActionDtoAction;
  /**
* Current action status
*/
readonly "status": ActionDtoStatus;
  /**
* Unsigned transactions to sign and submit
*/
readonly "transactions": ReadonlyArray<TransactionDto>
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

/**
* Transaction status after submission
*/
export type SubmitTransactionResponseDtoStatus = "CREATED" | "SIGNED" | "BROADCASTED" | "CONFIRMED" | "FAILED" | "NOT_FOUND"

export interface SubmitTransactionResponseDto {
  /**
* Transaction hash or order ID
*/
readonly "transactionHash": string;
  /**
* Link to view transaction on provider platform
*/
readonly "link": string;
  /**
* Transaction status after submission
*/
readonly "status": SubmitTransactionResponseDtoStatus;
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

export interface TokenControllerGetTokenPricesParams {
  readonly "X-API-KEY"?: string | undefined
}

export interface PriceRequestDto {
  readonly "currency": string;
  readonly "tokenList": ReadonlyArray<TokenDto>
}

export interface PriceResponseDto {
  
}

export interface StakeKitErrorDto {
  readonly "message": string;
  readonly "code": number;
  readonly "type"?: string | undefined;
  readonly "details"?: Record<string, unknown> | undefined;
  readonly "path"?: string | undefined
}

export interface TokenControllerGetTokenBalancesParams {
  readonly "X-API-KEY"?: string | undefined
}

export interface CosmosAdditionalAddressesDto {
  /**
* Cosmos SDK public key encoded in base64 for secp256k1
*/
readonly "cosmosPubKey": string
}

export interface BinanceAdditionalAddressesDto {
  readonly "binanceBeaconAddress": string
}

export interface SolanaAdditionalAddressesDto {
  readonly "stakeAccounts": ReadonlyArray<string>;
  readonly "lidoStakeAccounts": ReadonlyArray<string>
}

export interface TezosAdditionalAddressesDto {
  readonly "tezosPubKey": string
}

export interface AvalancheCAdditionalAddressesDto {
  readonly "cAddressBech": string;
  readonly "pAddressBech": string
}

export interface AddressWithTokenDto {
  readonly "address": string;
  readonly "additionalAddresses"?: CosmosAdditionalAddressesDto | BinanceAdditionalAddressesDto | SolanaAdditionalAddressesDto | TezosAdditionalAddressesDto | AvalancheCAdditionalAddressesDto | undefined;
  readonly "network": Networks;
  readonly "tokenAddress"?: string | undefined
}

export interface BalancesRequestDto {
  readonly "addresses": ReadonlyArray<AddressWithTokenDto>
}

export interface BalanceResponseDto {
  readonly "token": TokenDto;
  readonly "amount": string;
  readonly "availableYields": ReadonlyArray<string>
}

export type TokenControllerGetTokenBalances200 = ReadonlyArray<BalanceResponseDto>

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
    HttpClientRequest.setUrlParams({ "offset": options?.["offset"] as any, "limit": options?.["limit"] as any, "providerId": options?.["providerId"] as any }),
    onRequest(["2xx"], {"401":"MarketsControllerGetMarkets401","429":"MarketsControllerGetMarkets429"})
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
  ),
  "TokenControllerGetTokenPrices": (options) => HttpClientRequest.post(`/v1/tokens/prices`).pipe(
    HttpClientRequest.setHeaders({ "X-API-KEY": options.params?.["X-API-KEY"] ?? undefined }),
    HttpClientRequest.bodyUnsafeJson(options.payload),
    onRequest(["2xx"], {"400":"StakeKitErrorDto","401":"StakeKitErrorDto","404":"StakeKitErrorDto","408":"StakeKitErrorDto","412":"StakeKitErrorDto","429":"StakeKitErrorDto","500":"StakeKitErrorDto","501":"StakeKitErrorDto","503":"StakeKitErrorDto"})
  ),
  "TokenControllerGetTokenBalances": (options) => HttpClientRequest.post(`/v1/tokens/balances`).pipe(
    HttpClientRequest.setHeaders({ "X-API-KEY": options.params?.["X-API-KEY"] ?? undefined }),
    HttpClientRequest.bodyUnsafeJson(options.payload),
    onRequest(["2xx"], {"400":"StakeKitErrorDto","401":"StakeKitErrorDto","404":"StakeKitErrorDto","408":"StakeKitErrorDto","412":"StakeKitErrorDto","429":"StakeKitErrorDto","500":"StakeKitErrorDto","501":"StakeKitErrorDto","503":"StakeKitErrorDto"})
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
  /**
* Returns the token prices for a specific list of tokens
*/
readonly "TokenControllerGetTokenPrices": (options: { readonly params?: TokenControllerGetTokenPricesParams | undefined; readonly payload: PriceRequestDto }) => Effect.Effect<PriceResponseDto, HttpClientError.HttpClientError | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto>>
  /**
* Returns the balances for specific addresses and token addresses
*/
readonly "TokenControllerGetTokenBalances": (options: { readonly params?: TokenControllerGetTokenBalancesParams | undefined; readonly payload: BalancesRequestDto }) => Effect.Effect<TokenControllerGetTokenBalances200, HttpClientError.HttpClientError | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto> | SKClientError<"StakeKitErrorDto", StakeKitErrorDto>>
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
