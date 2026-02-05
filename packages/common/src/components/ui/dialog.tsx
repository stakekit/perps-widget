import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import { cva, type VariantProps } from "class-variance-authority";
import { X } from "lucide-react";
import type { ComponentProps } from "react";
import { useRootContainer } from "../../context/root-container";
import { cn } from "../../lib/utils";

// Re-export the Root component
const Root = DialogPrimitive.Root;

// Re-export the Portal component
const Portal = ({
  children,
  ...props
}: ComponentProps<typeof DialogPrimitive.Portal>) => {
  const rootContainer = useRootContainer();

  return (
    <DialogPrimitive.Portal container={rootContainer} {...props}>
      {children}
    </DialogPrimitive.Portal>
  );
};

// Re-export the Trigger component
const Trigger = DialogPrimitive.Trigger;

// Backdrop with default styles
function Backdrop({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Backdrop>) {
  return (
    <DialogPrimitive.Backdrop
      className={cn(
        "fixed inset-0 bg-black/60 backdrop-blur-sm z-40",
        "animate-in fade-in duration-200",
        "data-ending-style:opacity-0 data-starting-style:opacity-0",
        className,
      )}
      {...props}
    />
  );
}

const dialogPopupVariants = cva(
  [
    "fixed z-50",
    "bg-[#151515] rounded-2xl overflow-hidden",
    "animate-in fade-in zoom-in-95 duration-200",
    "data-[ending-style]:opacity-0 data-[ending-style]:scale-95",
    "data-[starting-style]:opacity-0 data-[starting-style]:scale-95",
  ],
  {
    variants: {
      position: {
        center: "left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2",
        top: "left-1/2 top-[10%] -translate-x-1/2",
        bottom: "left-1/2 bottom-[10%] -translate-x-1/2",
      },
      size: {
        sm: "w-full max-w-[350px]",
        default: "w-full max-w-[450px]",
        lg: "w-full max-w-[600px]",
        xl: "w-full max-w-[800px]",
        full: "w-[calc(100vw-3rem)]",
      },
    },
    defaultVariants: {
      position: "center",
      size: "default",
    },
  },
);

interface DialogPopupProps
  extends ComponentProps<typeof DialogPrimitive.Popup>,
    VariantProps<typeof dialogPopupVariants> {}

function Popup({ className, position, size, ...props }: DialogPopupProps) {
  return (
    <DialogPrimitive.Popup
      className={cn(dialogPopupVariants({ position, size, className }))}
      {...props}
    />
  );
}

// Content wrapper for consistent padding
function Content({ className, children, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 pb-5 pt-6 px-6", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Header with title and optional close button
interface DialogHeaderProps extends ComponentProps<"div"> {
  showClose?: boolean;
  onClose?: () => void;
}

function Header({
  className,
  children,
  showClose = true,
  onClose,
  ...props
}: DialogHeaderProps) {
  return (
    <div
      className={cn("flex items-center justify-between", className)}
      {...props}
    >
      {children}
      {showClose && (
        <DialogPrimitive.Close
          className="p-1 rounded-full hover:bg-gray-5 transition-colors cursor-pointer"
          onClick={onClose}
        >
          <X className="size-6 text-gray-2" />
        </DialogPrimitive.Close>
      )}
    </div>
  );
}

// Title with default styles
function Title({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
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
}: ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      className={cn("text-md text-gray-2", className)}
      {...props}
    />
  );
}

// Close button - re-export with default styles option
function Close({
  className,
  ...props
}: ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close className={cn(className)} {...props} />;
}

// Footer for action buttons
function Footer({ className, ...props }: ComponentProps<"div">) {
  return (
    <div className={cn("w-full mt-auto pt-6 flex", className)} {...props} />
  );
}

export const Dialog = {
  Root,
  Portal,
  Trigger,
  Backdrop,
  Content,
  Header,
  Title,
  Description,
  Close,
  Footer,
  Popup,
};
