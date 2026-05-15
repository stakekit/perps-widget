import { Context } from "effect";
import type { PerpsWalletAdapter } from "../domain/wallet-adapter";

export class WalletAdapterService extends Context.Service<
  WalletAdapterService,
  PerpsWalletAdapter
>()("perps/services/wallet-adapter/WalletAdapterService") {}
