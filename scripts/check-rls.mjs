// Checks that private tables are NOT reachable with the public (anon) key.
// Usage: npm run check:rls
//
// Safe by design — it never reads or changes real data:
//  - SELECT asks for a row count only (limit 0), no rows are returned or printed;
//  - INSERT sends an empty object: if access were allowed, NOT NULL constraints reject it;
//  - UPDATE / DELETE target an id that cannot exist, so at most 0 rows are affected.
// Exit code 1 if any check fails.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]),
);
const url = env.VITE_SUPABASE_URL;
const key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
if (!url || !key) throw new Error("VITE_SUPABASE_URL / VITE_SUPABASE_PUBLISHABLE_KEY missing in .env");

const headers = { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Prefer: "return=minimal" };
const NO_ID = "00000000-0000-0000-0000-000000000000";
const results = [];

async function probe(label, method, pathAndQuery, body, extraHeaders = {}) {
  const res = await fetch(`${url}/rest/v1/${pathAndQuery}`, {
    method,
    headers: { ...headers, ...extraHeaders },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  let code = "";
  try {
    code = JSON.parse(text).code ?? "";
  } catch {
    /* empty body */
  }
  const missing = res.status === 404;
  const denied = missing || res.status === 401 || res.status === 403 || code === "42501" || code === "PGRST301";
  const detail = missing
    ? "table absente (migration non appliquée)"
    : denied
    ? "refusé"
    : method === "GET"
      ? `ACCESSIBLE (${res.headers.get("content-range") ?? "?"} lignes)`
      : code === "23502"
        ? "AUTORISÉ (rejeté seulement par une contrainte NOT NULL)"
        : `AUTORISÉ (HTTP ${res.status})`;
  results.push({ ok: denied, line: `${denied ? "OK   " : "ÉCHEC"} ${label.padEnd(36)} → ${detail}` });
}

for (const table of ["reservations", "vehicules", "admin_users"]) {
  await probe(`lecture ${table}`, "GET", `${table}?select=*&limit=0`, undefined, { Prefer: "count=exact" });
  await probe(`insertion ${table}`, "POST", table, {});
  if (table !== "admin_users") {
    await probe(`modification ${table}`, "PATCH", `${table}?id=eq.${NO_ID}`, { created_at: new Date(0).toISOString() });
    await probe(`suppression ${table}`, "DELETE", `${table}?id=eq.${NO_ID}`);
  } else {
    await probe(`suppression ${table}`, "DELETE", `${table}?user_id=eq.${NO_ID}`);
  }
}
{
  const res = await fetch(`${url}/rest/v1/rpc/is_admin`, { method: "POST", headers, body: "{}" });
  const ok = res.status === 401 || res.status === 403 || res.status === 404;
  results.push({ ok, line: `${ok ? "OK   " : "ÉCHEC"} ${"appel is_admin() en anonyme".padEnd(36)} → HTTP ${res.status}${res.status === 404 ? " (fonction absente : migration non appliquée)" : ""}` });
}

console.log(`Vérification des accès anonymes — ${new URL(url).host}\n`);
for (const r of results) console.log(r.line);
const failed = results.filter((r) => !r.ok).length;
console.log(failed ? `\n${failed} accès anonyme(s) possible(s) : données NON protégées.` : "\nAucun accès anonyme : données protégées.");
process.exit(failed ? 1 : 0);
