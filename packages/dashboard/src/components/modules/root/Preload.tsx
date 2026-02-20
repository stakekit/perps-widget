import { Result, useAtomMount, useAtomValue } from "@effect-atom/atom-react";
import {
  marketsAtom,
  moralisTokenBalancesAtom,
  ordersAtom,
  positionsAtom,
  providersAtom,
  providersBalancesAtom,
  refreshMarketsAtom,
  updateMarketsMidPriceAtom,
  updatePositionsMidPriceAtom,
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
  useAtomMount(updatePositionsMidPriceAtom(wallet.currentAccount.address));

  return null;
};

export const Preload = () => {
  const wallet = useAtomValue(walletAtom);
  useAtomMount(providersAtom);
  useAtomMount(marketsAtom);
  useAtomMount(refreshMarketsAtom);
  useAtomMount(updateMarketsMidPriceAtom);

  if (Result.isSuccess(wallet) && isWalletConnected(wallet.value)) {
    return <PreloadWalletConnectedAtoms wallet={wallet.value} />;
  }

  return null;
};
