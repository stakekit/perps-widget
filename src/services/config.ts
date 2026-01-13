import { ConfigProvider, Effect, Schema } from "effect";

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

      const stakingBaseUrl = yield* Schema.Config(
        "VITE_STAKING_BASE_URL",
        Schema.NonEmptyString,
      );
      const stakingApiKey = yield* Schema.Config(
        "VITE_STAKING_API_KEY",
        Schema.NonEmptyString,
      );

      const forceAddress = yield* Schema.Config(
        "VITE_FORCE_ADDRESS",
        Schema.NonEmptyString,
      );

      return {
        perpsBaseUrl,
        perpsApiKey,

        stakingBaseUrl,
        stakingApiKey,

        forceAddress,
      };
    }).pipe(
      Effect.withConfigProvider(ConfigProvider.fromJson(import.meta.env)),
    ),
  },
) {}
