import { HttpClient, HttpClientRequest } from "@effect/platform";
import { Effect, Schema } from "effect";
import { toast } from "sonner";
import { ConfigService } from "../config";
import { HttpClientService } from "../http-client";
import * as ApiClientFactory from "./client-factory";

export class ApiClientService extends Effect.Service<ApiClientService>()(
  "perps/services/api-client-service/ApiClientService",
  {
    accessors: true,
    dependencies: [ConfigService.Default, HttpClientService.Default],
    effect: Effect.gen(function* () {
      const { perpsBaseUrl, perpsApiKey } = yield* ConfigService;

      const httpClient = yield* HttpClientService.pipe(
        Effect.andThen((client) =>
          client.pipe(
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
                  Schema.decodeUnknown(
                    Schema.Struct({
                      details: Schema.Struct({ message: Schema.String }),
                    }),
                  ),
                ),
                Effect.tap((e) => toast.error(e.details.message)),
                Effect.catchAll((e) =>
                  Effect.logError(e).pipe(
                    Effect.andThen(() =>
                      Effect.sync(() => toast.error("Something went wrong")),
                    ),
                  ),
                ),
              );
            }),
          ),
        ),
      );

      return ApiClientFactory.make(httpClient);
    }),
  },
) {}
