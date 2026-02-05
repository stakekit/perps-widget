import { createRootRoute, Outlet } from "@tanstack/react-router";
import { Header } from "../components/molecules/header";

function RootLayout() {
  return (
    <>
      <Header />
      <main className="flex-1 flex *:flex-1 *:max-w-[1720px] justify-center px-1.5">
        <Outlet />
      </main>
    </>
  );
}

export const Route = createRootRoute({
  component: RootLayout,
});
