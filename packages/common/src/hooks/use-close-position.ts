import { useAtomSet, useAtomValue } from "@effect/atom-react";
import {
  closePercentageAtom,
  submitCloseAtom,
} from "../atoms/close-position-atoms";
import type { Position } from "../domain";
import { getCloseCalculations } from "../lib/math";

export const useClosePercentage = () => {
  const closePercentage = useAtomValue(closePercentageAtom);
  const setClosePercentage = useAtomSet(closePercentageAtom);

  return {
    closePercentage,
    setClosePercentage,
  };
};

export const useCloseCalculations = (position: Position) => {
  const { closePercentage } = useClosePercentage();

  return getCloseCalculations(position, closePercentage);
};

export const useSubmitClose = () => {
  const submitResult = useAtomValue(submitCloseAtom);
  const submitClose = useAtomSet(submitCloseAtom);

  return {
    submitResult,
    submitClose,
  };
};
