import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],
  build: {
    // Hashed bundles live apart from public/assets so they can be cached forever (see _headers).
    assetsDir: "static",
    rollupOptions: {
      output: {
        manualChunks: {
          react: ["react", "react-dom", "react-router-dom"],
          motion: ["framer-motion"],
          gsap: ["gsap"],
        },
      },
    },
  },
  server: {
    port: 5173,
    // same-origin /api in dev, mirroring production; works from phones on the LAN too
    proxy: {
      "/api": "http://127.0.0.1:8787",
    },
  },
});
