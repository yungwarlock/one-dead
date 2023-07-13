import {defineConfig} from "vite";
import {VitePWA} from "vite-plugin-pwa";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tsconfigPaths(),
    VitePWA({
      registerType: "autoUpdate", workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      }
    }),
  ],
});
