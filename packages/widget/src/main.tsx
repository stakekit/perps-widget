import "./styles.css";
import "./main.css";
import type { PerpsConfig } from "@yieldxyz/perps-common/services";
import ReactDOM from "react-dom/client";
import { Widget } from "./app";

const config: PerpsConfig = {
  perpsBaseUrl: import.meta.env.VITE_PERPS_BASE_URL,
  perpsApiKey: import.meta.env.VITE_PERPS_API_KEY,
  reownProjectId: import.meta.env.VITE_REOWN_PROJECT_ID || undefined,
  moralisApiKey: import.meta.env.VITE_MORALIS_API_KEY,
};

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Widget config={config} />);
}
