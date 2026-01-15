import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="bg-background w-[400px] min-h-[600px] rounded-3xl py-6 px-4 flex flex-col *:flex-1">
        <Outlet />
      </div>
    </>
  ),
});
