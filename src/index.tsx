import {
  // createMemoryHistory,
  createRouter,
  RouterProvider,
} from "@tanstack/react-router";
import { StrictMode } from "react";
import {
  RootContainerProvider,
  useRootContainer,
} from "@/context/root-container.tsx";
import { routeTree } from "./routeTree.gen.ts";

// const history = createMemoryHistory();

// Create a new router instance
const router = createRouter({
  routeTree,
  context: {},
  defaultPreload: "intent",
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
  // history,
});

// Register the router instance for type safety
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
      className="dark min-h-screen bg-[#131517] p-8 flex justify-center items-center"
    >
      <StrictMode>
        <RouterProvider router={router} />
      </StrictMode>
    </div>
  );
};

const AppWithProviders = () => {
  return (
    <RootContainerProvider>
      <App />
    </RootContainerProvider>
  );
};

export default AppWithProviders;
