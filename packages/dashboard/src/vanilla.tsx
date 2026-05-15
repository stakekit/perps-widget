import ReactDOM from "react-dom/client";
import { Dashboard, type DashboardProps } from "./app";

export type DashboardMountTarget = Element | DocumentFragment | string;

export type MountedDashboard = {
  readonly unmount: () => void;
};

const getMountTarget = (target: DashboardMountTarget) => {
  if (typeof target !== "string") {
    return target;
  }

  const element = document.querySelector(target);

  if (!element) {
    throw new Error(`Dashboard mount target not found: ${target}`);
  }

  return element;
};

export const mountDashboard = (
  target: DashboardMountTarget,
  props: DashboardProps,
): MountedDashboard => {
  const root = ReactDOM.createRoot(getMountTarget(target));

  root.render(<Dashboard {...props} />);

  return {
    unmount: () => root.unmount(),
  };
};

export type { DashboardProps } from "./app";
