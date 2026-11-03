import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // useRecommendedBuildConfig:false stops the plugin from forcing every asset
  // (including all woff/woff2 files) into the HTML as base64. JS and CSS are
  // still inlined; fonts become small, cacheable files fetched only for the
  // unicode ranges actually rendered. That cut the initial document from
  // ~800 KB to ~150 KB.
  plugins: [react(), tailwindcss(), viteSingleFile({ useRecommendedBuildConfig: false })],
  base: "./",
  build: {
    target: "es2020",
    cssCodeSplit: false,
    assetsDir: "",
    assetsInlineLimit: 0,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    host: true,
    // The dev server is previewed through a proxy host, not from localhost.
    allowedHosts: [".e2b.app", ".localhost"],
  },
});
