import { useAtom } from "@effect-atom/atom-react";
import { editSLTPAtom } from "../atoms/edit-position-atoms";
import { updateLeverageAtom } from "../atoms/position-pending-actions-atom";

export const useEditSLTP = () => {
  const [editSLTPResult, editSLTP] = useAtom(editSLTPAtom);

  return {
    editSLTPResult,
    editSLTP,
  };
};

export const useUpdateLeverage = () => {
  const [updateLeverageResult, updateLeverage] = useAtom(updateLeverageAtom);

  return {
    updateLeverageResult,
    updateLeverage,
  };
};
