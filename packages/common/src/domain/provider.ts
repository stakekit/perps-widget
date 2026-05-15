import { Schema } from "effect";
import * as ApiSchemas from "../services/api-client/api-schemas";
import { ProviderId } from "./ids";

export class Provider extends Schema.Class<Provider>("Provider")({
  ...ApiSchemas.ProviderDto.fields,
  id: ProviderId,
  supportedActions: Schema.Array(ApiSchemas.PerpActionTypes),
}) {}
