import { Config, ConfigProvider, Context, Effect, Layer } from "effect";

export class ConfigService extends Context.Service<ConfigService>()(
  "perps/services/config-service/ConfigService",
  {
    make: Effect.gen(function* () {
      const provider = ConfigProvider.fromEnv({
        env: import.meta.env,
      });
      const read = <A>(config: Config.Config<A>) => config.parse(provider);

      const perpsBaseUrl = yield* read(
        Config.nonEmptyString("VITE_PERPS_BASE_URL"),
      );
      const perpsApiKey = yield* read(
        Config.nonEmptyString("VITE_PERPS_API_KEY"),
      );

      const reownProjectId = yield* read(
        Config.nonEmptyString("VITE_REOWN_PROJECT_ID").pipe(Config.option),
      );

      const moralisApiKey = yield* read(
        Config.nonEmptyString("VITE_MORALIS_API_KEY"),
      );

      return {
        perpsBaseUrl,
        perpsApiKey,
        reownProjectId,
        moralisApiKey,
      };
    }),
  },
) {
  static readonly layer = Layer.effect(this, this.make);
}
