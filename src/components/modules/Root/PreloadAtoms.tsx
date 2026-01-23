import { Result, useAtomMount, useAtomValue } from "@effect-atom/atom-react";
import { marketsAtom, refreshMarketsAtom } from "@/atoms/markets-atoms";
import {
  ordersAtom,
  positionsAtom,
  providersBalancesAtom,
} from "@/atoms/portfolio-atoms";
import { providersAtom } from "@/atoms/providers-atoms";
import { moralisTokenBalancesAtom } from "@/atoms/tokens-atoms";
import { walletAtom } from "@/atoms/wallet-atom";
import { isWalletConnected, type WalletConnected } from "@/domain/wallet";

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
