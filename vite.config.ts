import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

  plugins: [react(), mode === "development" && componentTagger()].filter(
    Boolean,
  ),

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
