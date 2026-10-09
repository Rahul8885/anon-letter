import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    // same-origin /api in dev, mirroring production; works from phones on the LAN too
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
});
