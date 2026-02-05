import { Slider as SliderPrimitive } from "@base-ui/react/slider";
import { cva, type VariantProps } from "class-variance-authority";
import type { ReactNode } from "react";
import React from "react";
import { cn } from "../../lib/utils";

const sliderControlVariants = cva(
  "relative flex touch-none select-none items-center",
  {
    variants: {
      size: {
        default: "h-5 w-full",
        sm: "h-4 w-full",
        lg: "h-6 w-full",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

const sliderTrackVariants = cva(
  "absolute top-1/2 -translate-y-1/2 left-0 right-0 rounded-xl select-none",
  {
    variants: {
      size: {
        default: "h-2",
        sm: "h-1.5",
        lg: "h-2.5",
      },
      variant: {
        default: "bg-white/5",
        muted: "bg-white/10",
        gray: "bg-gray-5",
      },
    },
    defaultVariants: {
      size: "default",
      variant: "default",
    },
  },
);

const sliderIndicatorVariants = cva("rounded-xl select-none", {
  variants: {
    variant: {
      default: "bg-white/35",
      primary: "bg-white",
      accent: "bg-accent-green",
      gray: "bg-gray-4",
    },
  },
  defaultVariants: {
    variant: "default",
  },
});

const sliderThumbVariants = cva(
  "absolute top-1/2 -translate-y-1/2 -translate-x-1/2 bg-white shadow-lg select-none transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-white/50",
  {
    variants: {
      size: {
        default: "w-[19px] h-5 rounded-xl",
        round: "size-5 rounded-full",
        sm: "size-4 rounded-full",
        lg: "size-6 rounded-full",
        none: "opacity-0 size-0",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface SliderRootProps
  extends SliderPrimitive.Root.Props,
    VariantProps<typeof sliderControlVariants> {
  trackVariant?: VariantProps<typeof sliderTrackVariants>["variant"];
  indicatorVariant?: VariantProps<typeof sliderIndicatorVariants>["variant"];
  thumbSize?: VariantProps<typeof sliderThumbVariants>["size"];
  stops?: (number | { value: number; label: ReactNode })[];
  onStopClick?: (value: number) => void;
  stopLabels?: ReactNode[];
}

function Slider({
  className,
  size,
  trackVariant,
  indicatorVariant,
  thumbSize,
  stops = [0, 25, 50, 75, 100],
  onStopClick,
  ...props
}: SliderRootProps) {
  return (
    <SliderPrimitive.Root {...props}>
      <SliderPrimitive.Control
        className={cn(sliderControlVariants({ size, className }))}
      >
        <SliderPrimitive.Track
          className={cn(
            sliderTrackVariants({ size, variant: trackVariant }),
            "w-full",
          )}
        >
          <SliderPrimitive.Indicator
            className={cn(
              sliderIndicatorVariants({ variant: indicatorVariant }),
            )}
          />
          {stops.map((stop, index) => {
            const key = typeof stop === "number" ? stop : stop.value;
            const value = typeof stop === "number" ? stop : stop.value;
            const label = typeof stop === "number" ? null : stop.label;

            const left = `${(index / (stops.length - 1)) * 100}%`;

            return (
              <React.Fragment key={key}>
                <button
                  type="button"
                  className="absolute top-1/2 -translate-y-1/2 size-1 bg-white rounded-full -translate-x-1/2 cursor-pointer z-10"
                  style={{ left }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onStopClick?.(value);
                  }}
                />

                {label && (
                  <div
                    className="absolute top-6 text-foreground text-sm -translate-y-1/2 -translate-x-1/2 cursor-pointer z-10"
                    style={{ left }}
                  >
                    {label}%
                  </div>
                )}
              </React.Fragment>
            );
          })}
          <SliderPrimitive.Thumb
            className={cn(sliderThumbVariants({ size: thumbSize ?? size }))}
          />
        </SliderPrimitive.Track>
      </SliderPrimitive.Control>
    </SliderPrimitive.Root>
  );
}

// Export individual primitives for custom compositions
const SliderRoot = SliderPrimitive.Root;
const SliderControl = SliderPrimitive.Control;
const SliderTrack = SliderPrimitive.Track;
const SliderIndicator = SliderPrimitive.Indicator;
const SliderThumb = SliderPrimitive.Thumb;

export {
  Slider,
  SliderRoot,
  SliderControl,
  SliderTrack,
  SliderIndicator,
  SliderThumb,
  sliderControlVariants,
  sliderTrackVariants,
  sliderIndicatorVariants,
  sliderThumbVariants,
};
