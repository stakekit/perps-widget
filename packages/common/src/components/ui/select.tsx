import { Select as SelectPrimitive } from "@base-ui/react/select";
import { cva, type VariantProps } from "class-variance-authority";
import { Check, ChevronDown } from "lucide-react";
import type { ComponentProps, ReactNode } from "react";
import { useRootContainer } from "../../context/root-container";
import { cn } from "../../lib/utils";

// Re-export the Root component
const Root = SelectPrimitive.Root;

// Re-export the Value component
const Value = SelectPrimitive.Value;

// Re-export the Icon component
const Icon = SelectPrimitive.Icon;

// Re-export the Group component
const Group = SelectPrimitive.Group;

// Re-export the GroupLabel component
const GroupLabel = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.GroupLabel>) => (
  <SelectPrimitive.GroupLabel
    className={cn(
      "px-3 py-2 text-xs font-medium text-gray-2 uppercase tracking-wider",
      className,
    )}
    {...props}
  />
);

const selectTriggerVariants = cva(
  [
    "flex items-center justify-between gap-2",
    "bg-white/5 rounded-lg",
    "text-white text-[13px]",
    "transition-colors",
    "hover:bg-white/10",
    "focus:outline-none",
    "disabled:opacity-50 disabled:cursor-not-allowed",
  ],
  {
    variants: {
      size: {
        sm: "h-8 px-3",
        default: "h-10 px-3.5",
        lg: "h-12 px-4",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

interface TriggerProps
  extends ComponentProps<typeof SelectPrimitive.Trigger>,
    VariantProps<typeof selectTriggerVariants> {}

function Trigger({ className, size, children, ...props }: TriggerProps) {
  return (
    <SelectPrimitive.Trigger
      className={cn(selectTriggerVariants({ size, className }))}
      {...props}
    >
      {children}
      <SelectPrimitive.Icon>
        <ChevronDown className="size-4 text-gray-2" />
      </SelectPrimitive.Icon>
    </SelectPrimitive.Trigger>
  );
}

// Portal with container support
const Portal = ({
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.Portal>) => {
  const rootContainer = useRootContainer();

  return (
    <SelectPrimitive.Portal container={rootContainer} {...props}>
      {children}
    </SelectPrimitive.Portal>
  );
};

// Positioner for positioning the popup
function Positioner({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Positioner>) {
  return (
    <SelectPrimitive.Positioner
      className={cn("z-50 outline-none", className)}
      sideOffset={4}
      {...props}
    />
  );
}

// Popup with default styles
function Popup({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Popup>) {
  return (
    <SelectPrimitive.Popup
      className={cn(
        "min-w-[var(--anchor-width)]",
        "bg-[#1a1a1a] rounded-xl border border-white/10",
        "shadow-lg shadow-black/20",
        "py-1 overflow-hidden",
        "animate-in fade-in zoom-in-95 duration-150",
        "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
        "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
        className,
      )}
      {...props}
    />
  );
}

// Item with default styles
interface ItemProps extends ComponentProps<typeof SelectPrimitive.Item> {
  icon?: ReactNode;
  showIndicator?: boolean;
}

function Item({
  className,
  icon,
  children,
  showIndicator = true,
  ...props
}: ItemProps) {
  return (
    <SelectPrimitive.Item
      className={cn(
        "flex items-center gap-2 px-3 py-2.5",
        "text-[13px] text-white/80",
        "cursor-pointer transition-colors",
        "hover:bg-white/5",
        "data-[highlighted]:bg-white/5",
        "data-[selected]:text-white",
        !showIndicator && "data-[selected]:bg-white/5",
        "outline-none",
        className,
      )}
      {...props}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <SelectPrimitive.ItemText className="flex-1">
        {children}
      </SelectPrimitive.ItemText>
      {showIndicator && (
        <SelectPrimitive.ItemIndicator>
          <Check className="size-4 text-accent-green" />
        </SelectPrimitive.ItemIndicator>
      )}
    </SelectPrimitive.Item>
  );
}

// ItemText component
const ItemText = ({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.ItemText>) => (
  <SelectPrimitive.ItemText className={cn("flex-1", className)} {...props} />
);

// ItemIndicator component
const ItemIndicator = ({
  className,
  children,
  ...props
}: ComponentProps<typeof SelectPrimitive.ItemIndicator>) => (
  <SelectPrimitive.ItemIndicator className={cn(className)} {...props}>
    {children ?? <Check className="size-4 text-accent-green" />}
  </SelectPrimitive.ItemIndicator>
);

// Separator
function Separator({
  className,
  ...props
}: ComponentProps<typeof SelectPrimitive.Separator>) {
  return (
    <SelectPrimitive.Separator
      className={cn("h-px bg-white/10 my-1", className)}
      {...props}
    />
  );
}

export const Select = {
  Root,
  Trigger,
  Value,
  Icon,
  Portal,
  Positioner,
  Popup,
  Group,
  GroupLabel,
  Item,
  ItemText,
  ItemIndicator,
  Separator,
};
