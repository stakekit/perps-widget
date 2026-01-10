import { createContext, useContext, useRef } from "react";

const RootContainerContext = createContext<
  React.RefObject<HTMLDivElement | null> | undefined
>(undefined);

export function RootContainerProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const rootContainer = useRef<HTMLDivElement>(null);

  return (
    <RootContainerContext.Provider value={rootContainer}>
      {children}
    </RootContainerContext.Provider>
  );
}

export function useRootContainer() {
  const context = useContext(RootContainerContext);
  if (!context) {
    throw new Error(
      "useRootContainer must be used within a RootContainerProvider",
    );
  }
  return context;
}
