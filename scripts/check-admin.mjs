// Checks that the administrator account gets the intended rights through Supabase Auth + RLS.
// Usage (in YOUR OWN terminal, so the password never leaves your machine): npm run check:admin
//
// The email and password are typed interactively (password hidden) and only sent to Supabase.
// Nothing is printed except OK / ÉCHEC lines and row counts. No data is changed:
//  - SELECT asks for counts only;
//  - INSERT sends an empty object (rejected by NOT NULL constraints once RLS lets it through);
//  - UPDATE / DELETE target an id that cannot exist (0 rows affected).
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { fileURLToPath } from "node:url";
import { createClient } from "@supabase/supabase-js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const env = Object.fromEntries(
  fs
    .readFileSync(path.join(root, ".env"), "utf8")
    .split(/\r?\n/)
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => [l.slice(0, l.indexOf("=")).trim(), l.slice(l.indexOf("=") + 1).trim().replace(/^"|"$/g, "")]),
);

function ask(question, hidden = false) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (hidden) {
      rl._writeToOutput = (s) => {
        if (s.includes(question)) rl.output.write(s);
      };
    }
    rl.question(question, (answer) => {
      rl.close();
      if (hidden) process.stdout.write("\n");
      resolve(answer.trim());
    });
  });
}

const email = process.env.ADMIN_EMAIL || (await ask("Email administrateur : "));
const password = await ask("Mot de passe (masqué) : ", true);

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_PUBLISHABLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const NO_ID = "00000000-0000-0000-0000-000000000000";
const lines = [];
const check = (ok, label, detail) => lines.push({ ok, text: `${ok ? "OK   " : "ÉCHEC"} ${label.padEnd(38)} → ${detail}` });

const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
check(!signInError, "connexion Supabase Auth", signInError ? signInError.message : "réussie");

if (!signInError) {
  const { data: isAdmin, error } = await supabase.rpc("is_admin");
  check(isAdmin === true, "is_admin()", error ? error.message : String(isAdmin));

  for (const table of ["reservations", "vehicules"]) {
    const sel = await supabase.from(table).select("id", { count: "exact", head: true });
    check(!sel.error, `lecture ${table}`, sel.error ? sel.error.message : `${sel.count} ligne(s) visibles`);

    const ins = await supabase.from(table).insert({});
    const insAllowed = ins.error?.code === "23502"; // passed RLS, stopped by NOT NULL: nothing written
    check(insAllowed, `insertion ${table} (autorisée)`, ins.error ? `${ins.error.code} ${insAllowed ? "(aucune ligne créée)" : ins.error.message}` : "inattendu");

    const upd = await supabase.from(table).update({ created_at: new Date(0).toISOString() }).eq("id", NO_ID);
    check(!upd.error, `modification ${table} (autorisée)`, upd.error ? upd.error.message : "0 ligne touchée");

    const del = await supabase.from(table).delete().eq("id", NO_ID);
    check(!del.error, `suppression ${table} (autorisée)`, del.error ? del.error.message : "0 ligne touchée");
  }

  // Even the admin must not read the membership table directly (only through is_admin()).
  const au = await supabase.from("admin_users").select("user_id", { count: "exact", head: true });
  check(!!au.error, "admin_users non lisible directement", au.error ? "refusé" : `LISIBLE (${au.count})`);

  await supabase.auth.signOut();
}

console.log("\nVérification du compte administrateur\n");
for (const l of lines) console.log(l.text);
const failed = lines.filter((l) => !l.ok).length;
console.log(failed ? `\n${failed} vérification(s) en échec.` : "\nCompte administrateur : droits conformes.");
process.exit(failed ? 1 : 0);
