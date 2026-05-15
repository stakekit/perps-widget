import { Context } from "effect";

export class ConfigService extends Context.Service<
  ConfigService,
  {
    readonly perpsBaseUrl: string;
    readonly perpsApiKey: string;
    readonly reownProjectId?: string;
    readonly moralisApiKey: string;
  }
>()("perps/services/config-service/ConfigService") {}

export type PerpsConfig = ConfigService["Service"];
