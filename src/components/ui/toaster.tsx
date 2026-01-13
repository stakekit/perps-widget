import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="dark"
      className="toaster group"
      position="top-right"
      closeButton
      icons={{
        success: <CircleCheckIcon className="size-4 text-accent-green" />,
        info: <InfoIcon className="size-4 text-blue-400" />,
        warning: <TriangleAlertIcon className="size-4 text-amber-400" />,
        error: <OctagonXIcon className="size-4 text-accent-red" />,
        loading: <Loader2Icon className="size-4 animate-spin text-gray-2" />,
      }}
      toastOptions={{
        classNames: {
          toast:
            "group toast bg-card/95 backdrop-blur-md border border-gray-3 shadow-xl shadow-black/20 rounded-lg",
          title: "text-foreground font-medium text-sm",
          description: "text-gray-2 text-xs",
          actionButton:
            "bg-primary text-primary-foreground text-xs font-medium px-3 py-1.5 rounded-md hover:bg-primary/90 transition-colors",
          cancelButton:
            "bg-gray-3 text-gray-1 text-xs font-medium px-3 py-1.5 rounded-md hover:bg-gray-4 transition-colors",
          closeButton:
            "!bg-gray-3 !border-gray-4 !text-gray-1 hover:!bg-gray-4 hover:!text-foreground !transition-colors !rounded-full",
          success: "!border-accent-green/30",
          error: "!border-accent-red/30",
          warning: "!border-amber-400/30",
          info: "!border-blue-400/30",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
