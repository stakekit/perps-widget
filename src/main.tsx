import ReactDOM from "react-dom/client";
import "./main.css";
import App from "@/index.tsx";

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<App />);
}
