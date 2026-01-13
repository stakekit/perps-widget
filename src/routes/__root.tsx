import { createRootRoute, Outlet } from "@tanstack/react-router";

export const Route = createRootRoute({
  component: () => (
    <>
      <div className="bg-background w-[400px] rounded-3xl py-6 px-4">
        <Outlet />
      </div>
    </>
  ),
});
