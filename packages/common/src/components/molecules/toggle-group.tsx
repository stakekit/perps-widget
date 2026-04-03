import { Toggle } from "@base-ui/react/toggle";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import type { ComponentProps } from "react";
import { cn } from "../../lib/utils";

export interface ToggleOption<T extends string = string> {
  value: T;
  label: string;
}

export interface ToggleGroupProps<T extends string = string>
  extends Omit<
    ComponentProps<typeof BaseToggleGroup>,
    "value" | "onValueChange"
  > {
  options: ToggleOption<T>[];
  value: T;
  onValueChange: (value: T) => void;
  variant?: "dark" | "light" | "compact";
}

export function ToggleGroup<T extends string>({
  options,
  value,
  onValueChange,
  variant = "dark",
  className,
  ...props
}: ToggleGroupProps<T>) {
  return (
    <BaseToggleGroup
      value={[value]}
      onValueChange={(values) => {
        const newValue = values[values.length - 1];
        if (newValue) {
          onValueChange(newValue as T);
        }
      }}
      className={cn(
        "flex items-center",
        variant === "compact" ? "gap-2" : "gap-2 w-full",
        className,
      )}
      {...props}
    >
      {options.map((option) => (
        <Toggle
          key={option.value}
          value={option.value}
          aria-label={option.label}
          className={cn(
            "flex items-center justify-center transition-colors cursor-pointer",
            variant === "dark" && [
              "flex-1 h-9 rounded-[10px]",
              "bg-gray-3 text-gray-2 hover:bg-gray-4 hover:text-foreground",
              "data-pressed:bg-gray-4 data-pressed:text-foreground",
            ],
            variant === "light" && [
              "flex-1 h-9 rounded-[10px]",
              "bg-white/60 text-gray-500 hover:bg-white hover:text-gray-900",
              "data-pressed:bg-white data-pressed:text-gray-900",
            ],
            variant === "compact" && [
              "flex-1 h-7 rounded-[10px] px-3",
              "bg-white/5 text-gray-2",
              "data-pressed:bg-white data-pressed:text-black",
            ],
          )}
        >
          <span
            className={cn(
              "font-semibold tracking-tight",
              variant === "compact" ? "text-xs" : "text-sm font-normal",
            )}
          >
            {option.label}
          </span>
        </Toggle>
      ))}
    </BaseToggleGroup>
  );
}
