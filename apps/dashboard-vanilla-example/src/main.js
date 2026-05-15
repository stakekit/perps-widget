import { mountDashboard } from "@yieldxyz/perps-dashboard/vanilla";
import "@yieldxyz/perps-dashboard/styles.css";
import "./styles.css";

const config = {
  perpsBaseUrl: import.meta.env.VITE_PERPS_BASE_URL,
  perpsApiKey: import.meta.env.VITE_PERPS_API_KEY,
  reownProjectId: import.meta.env.VITE_REOWN_PROJECT_ID || undefined,
  moralisApiKey: import.meta.env.VITE_MORALIS_API_KEY,
};

const dashboard = mountDashboard("#app", { config });

if (import.meta.hot) {
  import.meta.hot.dispose(() => dashboard.unmount());
}
