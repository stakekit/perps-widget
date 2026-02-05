import { StrictMode } from "react";
import { Toaster } from "../components/ui/toaster";
import { AppKit } from "./appkit";
import { RootContainerProvider } from "./root-container";

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

export * from "./root-container";
