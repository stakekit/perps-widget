import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster";
import { AppKit } from "@/context/appkit";
import { RootContainerProvider } from "@/context/root-container";

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <StrictMode>
      <AppKit>
        <RootContainerProvider>
          <Toaster />
          {children}
        </RootContainerProvider>
      </AppKit>
    </StrictMode>
  );
};
