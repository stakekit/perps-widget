import {
  ToggleGroup,
  type ToggleGroupProps,
} from "@/components/molecules/toggle-group";
import { Slider } from "@/components/ui/slider";

const percentageOptions = [
  { value: "25", label: "25%" },
  { value: "50", label: "50%" },
  { value: "75", label: "75%" },
  { value: "100", label: "MAX" },
];

export interface PercentageSliderProps {
  options?: ToggleGroupProps["options"];
  percentage: number;
  onPercentageChange: (percentage: number) => void;
}

export function PercentageSlider({
  options = percentageOptions,
  percentage,
  onPercentageChange,
}: PercentageSliderProps) {
  return (
    <div className="flex flex-col gap-1 w-full">
      {/* Slider Track */}
      <div className="flex flex-col gap-4 w-full">
        <Slider
          value={percentage}
          onValueChange={(value) =>
            onPercentageChange(Array.isArray(value) ? value[0] : value)
          }
          min={0}
          max={100}
          trackVariant="gray"
          indicatorVariant="gray"
        />

        {/* Percentage Quick Buttons */}
        <ToggleGroup
          options={options}
          value={String(percentage)}
          onValueChange={(v) => onPercentageChange(Number(v))}
        />
      </div>
    </div>
  );
}
