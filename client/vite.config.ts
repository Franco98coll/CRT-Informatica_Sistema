import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vuetify from "vite-plugin-vuetify";
import path from "node:path";

export default defineConfig({
  plugins: [vue(), vuetify({ autoImport: true })],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
    strictPort: true,
    proxy: {
      "/api": {
        target: "http://localhost:3002",
        changeOrigin: true,
        secure: false,
      },
      "/uploads": {
        target: "http://localhost:3002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
