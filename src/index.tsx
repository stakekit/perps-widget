import {
  // createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import { Toaster } from "@/components/ui/toaster.tsx";
import {
  RootContainerProvider,
  useRootContainer,
} from "@/context/root-container.tsx";
import "./styles.css";
import { PreloadAtoms } from "@/components/modules/Root/PreloadAtoms.tsx";
import { AppKit } from "@/context/appkit.tsx";
import { routeTree } from "./routeTree.gen.ts";

// const history = createMemoryHistory();

const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  // history,
});

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

const App = () => {
  const rootContainer = useRootContainer();

  return (
    <div
      ref={rootContainer}
      className="dark bg-background w-[400px] min-h-[600px] rounded-3xl py-6 px-4 flex flex-col *:flex-1"
    >
      <RouterProvider router={router} />
    </div>
  );
};

const AppWithProviders = () => {
  return (
    <StrictMode>
      <AppKit>
        <RootContainerProvider>
          <Toaster />
          <App />
          <PreloadAtoms />
        </RootContainerProvider>
      </AppKit>
    </StrictMode>
  );
};

export default AppWithProviders;
