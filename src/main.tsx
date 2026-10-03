import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

const container = document.getElementById("root")!;
const html = document.documentElement;

// Prerendered pages are French + EUR. Visitors who saved another language or currency
// get a client render instead (the inline script in index.html hides the prerendered
// markup for them via the `csr` class, so they never see a flash of French).
if (container.hasChildNodes() && !html.classList.contains("csr")) {
  hydrateRoot(container, <App />);
} else {
  container.textContent = "";
  createRoot(container).render(<App />);
  requestAnimationFrame(() => html.classList.remove("csr"));
}
