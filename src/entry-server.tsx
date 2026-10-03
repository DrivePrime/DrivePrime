// Build-time renderer (not shipped to browsers): turns a public route into static HTML.
// Rendered in the default language and currency (French, EUR); see main.tsx for how
// visitors with another saved preference are handled.
import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import { AppProviders, AppRoutes } from "./AppRoutes";

export function render(url: string) {
  return renderToString(
    <AppProviders>
      <StaticRouter location={url} future={{ v7_relativeSplatPath: true }}>
        <AppRoutes />
      </StaticRouter>
    </AppProviders>,
  );
}
