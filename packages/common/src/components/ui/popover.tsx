import { Popover as PopoverPrimitive } from "@base-ui/react/popover";
import type { ComponentProps } from "react";
import { useRootContainer } from "../../context/root-container";
import { cn } from "../../lib/utils";

// Re-export the Root component
const Root = PopoverPrimitive.Root;

// Re-export the Trigger component
const Trigger = PopoverPrimitive.Trigger;

// Portal with container support
const Portal = ({
  children,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Portal>) => {
  const rootContainer = useRootContainer();

  return (
    <PopoverPrimitive.Portal container={rootContainer} {...props}>
      {children}
    </PopoverPrimitive.Portal>
  );
};

// Positioner for positioning the popup
function Positioner({
  className,
  sideOffset = 8,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Positioner>) {
  return (
    <PopoverPrimitive.Positioner
      className={cn("z-50 outline-none", className)}
      sideOffset={sideOffset}
      {...props}
    />
  );
}

// Popup with default styles
function Popup({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Popup>) {
  return (
    <PopoverPrimitive.Popup
      className={cn(
        "bg-[#1d1d1d] border border-[#3a3c46] rounded-[10px]",
        "shadow-lg shadow-black/20",
        "overflow-hidden",
        "animate-in fade-in zoom-in-95 duration-150",
        "data-ending-style:opacity-0 data-ending-style:scale-95",
        "data-starting-style:opacity-0 data-starting-style:scale-95",
        className,
      )}
      {...props}
    />
  );
}

// Arrow component
function Arrow({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Arrow>) {
  return (
    <PopoverPrimitive.Arrow
      className={cn(
        "data-[side=bottom]:top-[-8px]",
        "data-[side=left]:right-[-13px] data-[side=left]:rotate-90",
        "data-[side=right]:left-[-13px] data-[side=right]:-rotate-90",
        "data-[side=top]:bottom-[-8px] data-[side=top]:rotate-180",
        className,
      )}
      {...props}
    />
  );
}

// Title with default styles
function Title({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Title>) {
  return (
    <PopoverPrimitive.Title
      className={cn(
        "font-semibold text-md text-white tracking-[-0.42px]",
        className,
      )}
      {...props}
    />
  );
}

// Description with default styles
function Description({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Description>) {
  return (
    <PopoverPrimitive.Description
      className={cn("text-md text-gray-2", className)}
      {...props}
    />
  );
}

// Close button
function Close({
  className,
  ...props
}: ComponentProps<typeof PopoverPrimitive.Close>) {
  return <PopoverPrimitive.Close className={cn(className)} {...props} />;
}

export const Popover = {
  Root,
  Trigger,
  Portal,
  Positioner,
  Popup,
  Arrow,
  Title,
  Description,
  Close,
};
