// Post-build step: writes one HTML file per vehicle with route-specific <head> tags,
// plus a real 404 page. Crawlers and link previews (WhatsApp, Facebook…) that do not
// run JavaScript then see the correct title, canonical and image for each URL.
// The page body is still rendered by the React app.
//
// Texts mirror `meta` (fr) in src/i18n/translations.ts — keep both in sync.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const SITE = "https://driveprimecar.com";

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const source = fs.readFileSync(path.join(root, "src/data/vehicles.ts"), "utf8");
const assets = fs.readdirSync(path.join(dist, "assets"));

const esc = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const vehicles = [...source.matchAll(/\{\s*id: "([^"]+)",\s*name: "([^"]+)",[\s\S]*?transmission: "([^"]+)",[\s\S]*?pricePerDay: (\d+),\s*\.\.\.photo\("([^"]+)"\)/g)].map(
  ([, id, name, transmission, price, photo]) => ({ id, name, transmission, price: Number(price), photo }),
);
if (vehicles.length === 0) throw new Error("prerender-meta: no vehicles parsed from src/data/vehicles.ts");

const counts = vehicles.reduce((m, v) => m.set(v.name, (m.get(v.name) ?? 0) + 1), new Map());
const gearbox = { "Manu.": "Manuelle", "Auto.": "Automatique" };
const label = (v) => (counts.get(v.name) > 1 ? `${v.name} ${gearbox[v.transmission]}` : v.name);

function setHead(html, { title, description, url, image, width, height, robots }) {
  const rep = (re, value) => {
    if (!re.test(html)) throw new Error(`prerender-meta: tag not found ${re}`);
    html = html.replace(re, value);
  };
  rep(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  rep(/(<meta name="description" content=")[^"]*(")/, `$1${esc(description)}$2`);
  rep(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
  rep(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(description)}$2`);
  rep(/(<meta property="og:image" content=")[^"]*(")/, `$1${image}$2`);
  rep(/(<meta property="og:image:width" content=")[^"]*(")/, `$1${width}$2`);
  rep(/(<meta property="og:image:height" content=")[^"]*(")/, `$1${height}$2`);
  rep(/(<meta name="twitter:image" content=")[^"]*(")/, `$1${image}$2`);
  if (url) {
    rep(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`);
    rep(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`);
  } else {
    html = html.replace(/\s*<link rel="canonical" href="[^"]*" \/>/, "").replace(/\s*<meta property="og:url" content="[^"]*" \/>/, "");
  }
  if (robots) html = html.replace("<meta charset=\"UTF-8\" />", `<meta charset="UTF-8" />\n    <meta name="robots" content="${robots}" />`);
  return html;
}

// Preload the LCP image so it starts downloading before the JS bundle has run.
const asset = (prefix) => {
  const file = assets.find((a) => a.startsWith(prefix) && a.endsWith(".webp"));
  if (!file) throw new Error(`prerender-meta: missing asset ${prefix}`);
  return `/assets/${file}`;
};
const preload = (html, srcset, sizes) =>
  html.replace(
    "</title>",
    `</title>\n    <link rel="preload" as="image" imagesrcset="${srcset}" imagesizes="${sizes}" fetchpriority="high" />`,
  );

fs.mkdirSync(path.join(dist, "vehicule"), { recursive: true });
for (const v of vehicles) {
  const file = assets.find((a) => a.startsWith(`${v.photo}-1536-`) && a.endsWith(".webp"));
  if (!file) throw new Error(`prerender-meta: missing 1536px image for ${v.id}`);
  const name = label(v);
  const html = preload(setHead(template, {
    title: `Location ${name} à Marrakech | Drive Prime`,
    description: `Location ${name} à Marrakech à partir de ${v.price} € par jour. Réservation directe sur WhatsApp avec Drive Prime.`,
    url: `${SITE}/vehicule/${v.id}`,
    image: `${SITE}/assets/${file}`,
    width: 1536,
    height: 1024,
  }), `${asset(`${v.photo}-768-`)} 768w, ${asset(`${v.photo}-1536-`)} 1536w`, "(min-width: 1024px) 62vw, 100vw");
  fs.writeFileSync(path.join(dist, "vehicule", `${v.id}.html`), html);
}

fs.writeFileSync(
  path.join(dist, "404.html"),
  setHead(template, {
    title: "Page introuvable | Drive Prime",
    description: "Cette page n'existe pas ou n'est plus disponible.",
    url: null,
    image: `${SITE}/og-image.jpg`,
    width: 1200,
    height: 630,
    robots: "noindex",
  }),
);

// Home: preload the hero photo (written last, the template above must stay untouched).
fs.writeFileSync(
  path.join(dist, "index.html"),
  preload(template, `${asset("hero-960-")} 960w, ${asset("hero-1680-")} 1680w`, "100vw"),
);

console.log(`prerender-meta: ${vehicles.length} vehicle pages + 404.html`);
