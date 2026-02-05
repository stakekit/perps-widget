import { RootContainerProvider } from "../../src/context/root-container";
import "../../src/styles/index.css";
import { Toaster } from "sonner";

export const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <RootContainerProvider>
      <Toaster />
      {children}
    </RootContainerProvider>
  );
};
