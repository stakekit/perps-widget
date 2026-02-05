import "./main.css";
import ReactDOM from "react-dom/client";
import { Widget } from "./app";

import "@yieldxyz/perps-common/styles";

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Widget />);
}
