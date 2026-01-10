import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "gap-2 group/tabs flex data-[orientation=horizontal]:flex-col",
        className,
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "rounded-lg p-0 group-data-horizontal/tabs:h-9 data-[variant=line]:rounded-none group/tabs-list text-muted-foreground inline-flex w-fit items-center justify-center group-data-[orientation=vertical]/tabs:h-fit group-data-[orientation=vertical]/tabs:flex-col",
  {
    variants: {
      variant: {
        default: "bg-muted",
        line: "gap-2.5 bg-transparent",
        pill: "gap-1 bg-transparent p-0 h-auto",
        contained:
          "bg-[#121314] h-12 p-[5px] rounded-[10px] gap-[5px] w-full overflow-hidden",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(
        // Base styles
        "relative inline-flex h-9 flex-1 items-center justify-center whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition-all",
        // Default inactive state - dark background
        "bg-[#121314] text-muted-foreground",
        // Active state - white background, black text
        "data-active:bg-white data-active:text-black data-active:border data-active:border-white",
        // Pill variant styling via parent
        "group-data-[variant=pill]/tabs-list:bg-gray-5 group-data-[variant=pill]/tabs-list:rounded-full",
        "group-data-[variant=pill]/tabs-list:data-active:bg-foreground group-data-[variant=pill]/tabs-list:data-active:text-background",
        // Contained variant styling via parent
        "group-data-[variant=contained]/tabs-list:bg-transparent group-data-[variant=contained]/tabs-list:text-gray-2 group-data-[variant=contained]/tabs-list:rounded-[12px] group-data-[variant=contained]/tabs-list:h-9 group-data-[variant=contained]/tabs-list:border group-data-[variant=contained]/tabs-list:border-transparent",
        "group-data-[variant=contained]/tabs-list:data-active:bg-white group-data-[variant=contained]/tabs-list:data-active:text-black group-data-[variant=contained]/tabs-list:data-active:border-white",
        // Focus states
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        // Icon styling
        "[&_svg:not([class*='size-'])]:size-3.5 [&_svg]:pointer-events-none [&_svg]:shrink-0",
        className,
      )}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("text-sm flex-1 outline-none", className)}
      {...props}
    />
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants };
