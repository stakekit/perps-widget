import "./main.css";
import ReactDOM from "react-dom/client";
import { Dashboard } from "./app";

const rootElement = document.getElementById("app");
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(<Dashboard />);
}
