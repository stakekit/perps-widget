import { useAtomSet, useAtomValue } from "@effect-atom/atom-react";
import { editSLTPAtom } from "../atoms/edit-position-atoms";
import { updateLeverageAtom } from "../atoms/position-pending-actions-atom";

export const useEditSLTP = () => {
  const editTPResult = useAtomValue(editSLTPAtom("takeProfit"));
  const editTP = useAtomSet(editSLTPAtom("takeProfit"));

  const editSLResult = useAtomValue(editSLTPAtom("stopLoss"));
  const editSL = useAtomSet(editSLTPAtom("stopLoss"));

  return {
    editTPResult,
    editTP,
    editSLResult,
    editSL,
  };
};

export const useUpdateLeverage = () => {
  const updateLeverageResult = useAtomValue(updateLeverageAtom);
  const updateLeverage = useAtomSet(updateLeverageAtom);

  return {
    updateLeverageResult,
    updateLeverage,
  };
};
