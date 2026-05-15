import ReactDOM from "react-dom/client";
import { Widget, type WidgetProps } from "./app";

export type WidgetMountTarget = Element | DocumentFragment | string;

export type MountedWidget = {
  readonly unmount: () => void;
};

const getMountTarget = (target: WidgetMountTarget) => {
  if (typeof target !== "string") {
    return target;
  }

  const element = document.querySelector(target);

  if (!element) {
    throw new Error(`Widget mount target not found: ${target}`);
  }

  return element;
};

export const mountWidget = (
  target: WidgetMountTarget,
  props: WidgetProps,
): MountedWidget => {
  const root = ReactDOM.createRoot(getMountTarget(target));

  root.render(<Widget {...props} />);

  return {
    unmount: () => root.unmount(),
  };
};

export type { WidgetProps } from "./app";
