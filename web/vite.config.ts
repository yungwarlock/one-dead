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
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      },
      includeAssets: ["favicon.ico", "apple-touch-icon.png", "mask-icon.svg"],
      manifest: {
        name: "One Dead",
        short_name: "One Dead",
        description: "A strategic guessing game",
        theme_color: "#FFC107",
        icons: [
          {"src": "/favicon.ico", "type": "image/x-icon", "sizes": "16x16 32x32"},
          {"src": "/icon-192.png", "type": "image/png", "sizes": "192x192"},
          {"src": "/icon-512.png", "type": "image/png", "sizes": "512x512"},
          {"src": "/icon-192-maskable.png", "type": "image/png", "sizes": "192x192", "purpose": "maskable"},
          {"src": "/icon-512-maskable.png", "type": "image/png", "sizes": "512x512", "purpose": "maskable"}
        ]
      }
    }),
  ],
});
