import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import {
  closePercentageAtom,
  submitCloseAtom,
} from "../atoms/close-position-atoms";
import { getCloseCalculations } from "../lib/math";
import type { PositionDto } from "../services/api-client/api-schemas";

export const useClosePercentage = () => {
  const closePercentage = useAtomValue(closePercentageAtom);
  const setClosePercentage = useAtomSet(closePercentageAtom);

  return {
    closePercentage,
    setClosePercentage,
  };
};

export const useCloseCalculations = (position: PositionDto) => {
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
