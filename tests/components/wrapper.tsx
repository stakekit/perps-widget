import "../../src/styles.css";
import { Toaster } from "@/components/ui/toaster";
import { RootContainerProvider } from "@/context/root-container";

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <RootContainerProvider>
      <Toaster />
      {children}
    </RootContainerProvider>
  );
};
