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

export const PreloadAtoms = () => {
  const wallet = useAtomValue(walletAtom);
  useAtomMount(marketsAtom);
  useAtomMount(refreshMarketsAtom);
  useAtomMount(providersAtom);

  if (Result.isSuccess(wallet) && isWalletConnected(wallet.value)) {
    return <PreloadWalletConnectedAtoms wallet={wallet.value} />;
  }

  return null;
};
