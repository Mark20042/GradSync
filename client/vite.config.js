import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    nodePolyfills(),
    VitePWA({
      registerType: "autoUpdate",
      devOptions: {
        enabled: true,
      },
      includeAssets: ["3dgradsynnclogo.png", "gradsynclogoapp.png"],
      workbox: {
        maximumFileSizeToCacheInBytes: 12 * 1024 * 1024, // Increase limit to 12MB
      },
      manifest: {
        name: "GradSync",
        short_name: "GradSync",
        description: "Modern career platform for graduates",
        theme_color: "#2563eb",
        icons: [
          {
            src: "gradsynclogoapp.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any maskable",
          },
        ],
      },
    }),
  ],
  build: {
    chunkSizeWarningLimit: 3000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("lucide-react")) return "lucide";
            if (id.includes("framer-motion")) return "framer";
            if (id.includes("lottie")) return "lottie";
            if (id.includes("xlsx")) return "xlsx";
            if (id.includes("recharts")) return "charts";
            if (id.includes("jspdf") || id.includes("html2canvas") || id.includes("@react-pdf")) return "pdf";
            return "vendor";
          }
        },
      },
    },
  },
});
