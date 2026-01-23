import { Config, ConfigProvider, Effect, Schema } from "effect";

export class ConfigService extends Effect.Service<ConfigService>()(
  "perps/services/config-service/ConfigService",
  {
    effect: Effect.gen(function* () {
      const perpsBaseUrl = yield* Schema.Config(
        "VITE_PERPS_BASE_URL",
        Schema.NonEmptyString,
      );
      const perpsApiKey = yield* Schema.Config(
        "VITE_PERPS_API_KEY",
        Schema.NonEmptyString,
      );

      const reownProjectId = yield* Schema.Config(
        "VITE_REOWN_PROJECT_ID",
        Schema.NonEmptyString,
      ).pipe(Config.option);

      const moralisApiKey = yield* Schema.Config(
        "VITE_MORALIS_API_KEY",
        Schema.NonEmptyString,
      );

      return {
        perpsBaseUrl,
        perpsApiKey,
        reownProjectId,
        moralisApiKey,
      };
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromJson(import.meta.env)),
      Effect.orDie,
    ),
  },
) {}
