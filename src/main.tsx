import { createRoot, hydrateRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Supabase auth links (password recovery) land on the Site URL ("/") with their data in the hash.
// Send them to the reset page before anything renders: the public site never loads Supabase.
// The hash is passed through untouched and never read or logged here beyond its type/error flags.
const RESET_PATH = "/admin/reset-password";
let leaving = false;
{
  const hash = new URLSearchParams(window.location.hash.slice(1));
  const query = new URLSearchParams(window.location.search);
  const failed =
    hash.has("error") || hash.has("error_code") || query.has("error_code");
  const recovery =
    hash.get("type") === "recovery" || query.get("type") === "recovery";
  if (
    failed &&
    (recovery ||
      window.location.pathname === "/" ||
      window.location.pathname === RESET_PATH)
  ) {
    // expired / invalid link: drop the hash, show a clean message
    leaving = true;
    window.location.replace(RESET_PATH + "?status=invalid");
  } else if (recovery && query.get("flow") !== "recovery") {
    // marker (not a secret) telling the reset page this visit comes from a recovery link
    leaving = true;
    window.location.replace(
      RESET_PATH + "?flow=recovery" + window.location.hash,
    );
  }
}

const container = document.getElementById("root")!;
const html = document.documentElement;

// Prerendered pages are French + EUR. Visitors who saved another language or currency
// get a client render instead (the inline script in index.html hides the prerendered
// markup for them via the `csr` class, so they never see a flash of French).
if (leaving) {
  // navigating to the reset page: render nothing here
} else if (container.hasChildNodes() && !html.classList.contains("csr")) {
  hydrateRoot(container, <App />);
} else {
  container.textContent = "";
  createRoot(container).render(<App />);
  requestAnimationFrame(() => html.classList.remove("csr"));
}
