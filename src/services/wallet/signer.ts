import { Context } from "effect";
import type { Signer } from "@/domain/signer";

export class SignerService extends Context.Tag(
  "perps/services/wallet/signer/SignerService",
)<SignerService, Signer>() {}
