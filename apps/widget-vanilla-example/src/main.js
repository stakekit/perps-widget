import { mountWidget } from "@yieldxyz/perps-widget/vanilla";
import "@yieldxyz/perps-widget/styles.css";
import "./styles.css";

const config = {
  perpsBaseUrl: "https://perps.yield.xyz",
  perpsApiKey: "e2d627cf-2ae3-4775-9fbc-76819c7cae38",
  reownProjectId: "29e1b718ad16983a0705cf24d5b5b747" || undefined,
  moralisApiKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJub25jZSI6IjhlNTk0NDE0LTg3NGMtNDZlMC1iMWNlLWU5ZjYzMjY1YWExMiIsIm9yZ0lkIjoiNDI2Nzk1IiwidXNlcklkIjoiNDM4OTk2IiwidHlwZSI6IlBST0pFQ1QiLCJ0eXBlSWQiOiI2YzMwMDY3Yi1kNDEyLTQwYjYtYTQ4OS0zYjEwM2ExNThjOGMiLCJpYXQiOjE3Mzc0NTA4NzcsImV4cCI6NDg5MzIxMDg3N30.pd8sKdRHdtlqoZVS7wb8Jyy2GLhhr95X8yW64W_gSC0",
};

const widget = mountWidget("#app", { config });

if (import.meta.hot) {
  import.meta.hot.dispose(() => widget.unmount());
}
