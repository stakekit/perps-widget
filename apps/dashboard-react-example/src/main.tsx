import { Dashboard, type PerpsConfig } from "@yieldxyz/perps-dashboard";
import "@yieldxyz/perps-dashboard/styles.css";
import { createRoot } from "react-dom/client";
import "./styles.css";

const config: PerpsConfig = {
  perpsBaseUrl: import.meta.env.VITE_PERPS_BASE_URL,
  perpsApiKey: import.meta.env.VITE_PERPS_API_KEY,
  reownProjectId: import.meta.env.VITE_REOWN_PROJECT_ID || undefined,
  moralisApiKey: import.meta.env.VITE_MORALIS_API_KEY,
};

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Root element not found");
}

createRoot(rootElement).render(<Dashboard config={config} />);
