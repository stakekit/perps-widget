import { Context, Effect, Layer } from "effect";
import { FetchHttpClient, HttpClient } from "effect/unstable/http";

export class HttpClientService extends Context.Service<HttpClientService>()(
  "perps/services/http-client/index/HttpClientService",
  {
    make: Effect.gen(function* () {
      const client = yield* HttpClient.HttpClient;

      return client.pipe(HttpClient.retryTransient({ times: 3 }));
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make).pipe(
    Layer.provide(FetchHttpClient.layer),
  );
}
