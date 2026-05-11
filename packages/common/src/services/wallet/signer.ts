import { Context } from "effect";
import type { Signer } from "../../domain/signer";

export class SignerService extends Context.Service<SignerService, Signer>()(
  "perps/services/wallet/signer/SignerService",
) {}
