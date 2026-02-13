import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: ["abdullah-corkier-gina.ngrok-free.dev"],
    hmr: {
      overlay: false,
    },
    proxy: {
      '/api-doc': {
        target: 'https://dev-api-iform-doc.impactodigifin.xyz',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api-doc/, '/api'),
      },
      '/api': {
        target: 'https://dev-api-iform.impactodigifin.xyz',
        changeOrigin: true,
        secure: true,
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
