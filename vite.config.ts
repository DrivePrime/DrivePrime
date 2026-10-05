import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath } from "url";
import fs from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// public/models holds 3D models under non-commercial licences (local prototype only):
// they are removed from every build output unless VITE_G63_LOCAL=true is set explicitly.
const dropLocalModels = () => ({
  name: "drop-local-models",
  apply: "build" as const,
  writeBundle(options: { dir?: string }) {
    if (
      process.env.VITE_G63_LOCAL === "true" ||
      process.env.VITE_3D_LOCAL === "true" ||
      !options.dir
    )
      return;
    fs.rmSync(path.join(options.dir, "models"), {
      recursive: true,
      force: true,
    });
  },
});

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // 👇 OBLIGATOIRE pour GitHub Pages
  base: "/",

  server: {
    host: "",
    port: 8080,
    // large media dropped into public/ while the server runs (3D models, videos) can be locked
    // by Windows mid-copy and crash the watcher; they are served as-is and need no watching
    watch: { ignored: ["**/public/models/**", "**/public/videos/**"] },
  },

  plugins: [
    react(),
    dropLocalModels(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
