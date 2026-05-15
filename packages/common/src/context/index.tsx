import { RegistryProvider, useAtomSubscribe } from "@effect/atom-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AsyncResult } from "effect/unstable/reactivity";
import { StrictMode } from "react";
import {
  externalWalletSourceAtom,
  lifecycleEventAtom,
  perpsConfigAtom,
} from "../atoms";
import { Toaster } from "../components/ui/toaster";
import type { ExternalWalletSource, LifecycleEvent } from "../domain";
import type { PerpsConfig } from "../services";
import { AppKit } from "./appkit";
import { RootContainerProvider } from "./root-container";

const queryClient = new QueryClient();

type ProvidersProps = {
  children: React.ReactNode;
  config: PerpsConfig;
  externalWalletSource?: ExternalWalletSource;
  onLifecycleEvent?: (event: LifecycleEvent) => void;
};

const ExternalLifecycleEventBridge = ({
  onLifecycleEvent,
}: {
  onLifecycleEvent: NonNullable<ProvidersProps["onLifecycleEvent"]>;
}) => {
  useAtomSubscribe(lifecycleEventAtom, (event) => {
    if (AsyncResult.isSuccess(event)) {
      onLifecycleEvent(event.value);
    }
  });

  return null;
};

const CommonProviders = ({ children }: { children: React.ReactNode }) => (
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RootContainerProvider>
        <Toaster />
        {children}
      </RootContainerProvider>
    </QueryClientProvider>
  </StrictMode>
);

export const Providers = ({
  children,
  config,
  externalWalletSource,
  onLifecycleEvent,
}: ProvidersProps) => {
  const initialValues = [
    [perpsConfigAtom, config] as const,
    ...(externalWalletSource
      ? ([[externalWalletSourceAtom, externalWalletSource]] as const)
      : []),
  ];

  if (externalWalletSource) {
    return (
      <RegistryProvider initialValues={initialValues}>
        <CommonProviders>
          {children}
          {onLifecycleEvent && (
            <ExternalLifecycleEventBridge onLifecycleEvent={onLifecycleEvent} />
          )}
        </CommonProviders>
      </RegistryProvider>
    );
  }

  return (
    <RegistryProvider initialValues={initialValues}>
      <AppKit>
        <CommonProviders>
          {children}
          {onLifecycleEvent && (
            <ExternalLifecycleEventBridge onLifecycleEvent={onLifecycleEvent} />
          )}
        </CommonProviders>
      </AppKit>
    </RegistryProvider>
  );
};

export * from "./root-container";
