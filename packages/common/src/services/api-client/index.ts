import { Context, Effect, Layer, Schema } from "effect";
import { HttpClient, HttpClientRequest } from "effect/unstable/http";
import { toast } from "sonner";
import { ConfigService } from "../config";
import { HttpClientService } from "../http-client";
import * as ApiClientFactory from "./client-factory";

export class ApiClientService extends Context.Service<ApiClientService>()(
  "perps/services/api-client-service/ApiClientService",
  {
    make: Effect.gen(function* () {
      const { perpsBaseUrl, perpsApiKey } = yield* ConfigService;

      const client = yield* HttpClientService;

      const httpClient = client.pipe(
        HttpClient.mapRequest((req) =>
          req.pipe(
            HttpClientRequest.prependUrl(perpsBaseUrl),
            HttpClientRequest.setHeader("X-API-KEY", perpsApiKey),
          ),
        ),
        HttpClient.tap((response) => {
          if (response.status >= 200 && response.status < 300) {
            return Effect.void;
          }

          return response.json.pipe(
            Effect.tap((e) => Effect.logError(e)),
            Effect.andThen(
              Schema.decodeUnknownEffect(
                Schema.Struct({
                  details: Schema.Struct({ message: Schema.String }),
                }),
              ),
            ),
            Effect.tap((e) =>
              Effect.sync(() => toast.error(e.details.message)),
            ),
            Effect.catch((e) =>
              Effect.logError(e).pipe(
                Effect.andThen(() =>
                  Effect.sync(() => toast.error("Something went wrong")),
                ),
              ),
            ),
          );
        }),
      );

      return ApiClientFactory.make(httpClient);
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(HttpClientService.layer),
  );
}
