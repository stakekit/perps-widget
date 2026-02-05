import { FetchHttpClient, HttpClient } from "@effect/platform";
import { Effect } from "effect";

export class HttpClientService extends Effect.Service<HttpClientService>()(
  "perps/services/http-client/index/HttpClientService",
  {
    dependencies: [FetchHttpClient.layer],
    effect: Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      return client.pipe(HttpClient.retryTransient({ times: 3 }));
    }),
  },
) {}
