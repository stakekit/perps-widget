import { Result, useAtomMount, useAtomValue } from "@effect-atom/atom-react";
import {
  marketsAtom,
  moralisTokenBalancesAtom,
  ordersAtom,
  positionsAtom,
  providersAtom,
  providersBalancesAtom,
  refreshMarketsAtom,
  walletAtom,
} from "@yieldxyz/perps-common/atoms";
import {
  isWalletConnected,
  type WalletConnected,
} from "@yieldxyz/perps-common/domain";
import { TRADING_VIEW_WIDGET_SCRIPT_URL } from "@yieldxyz/perps-common/services";
import { preload } from "react-dom";

const PreloadWalletConnectedAtoms = ({
  wallet,
}: {
  wallet: WalletConnected;
}) => {
  useAtomMount(moralisTokenBalancesAtom(wallet.currentAccount.address));
  useAtomMount(providersBalancesAtom(wallet.currentAccount.address));
  useAtomMount(positionsAtom(wallet.currentAccount.address));
  useAtomMount(ordersAtom(wallet.currentAccount.address));

  return null;
};

export const Preload = () => {
  preload(TRADING_VIEW_WIDGET_SCRIPT_URL, { as: "script" });

  const wallet = useAtomValue(walletAtom);
  useAtomMount(providersAtom);
  useAtomMount(marketsAtom);
  useAtomMount(refreshMarketsAtom);

  if (Result.isSuccess(wallet) && isWalletConnected(wallet.value)) {
    return <PreloadWalletConnectedAtoms wallet={wallet.value} />;
  }

  return null;
};
