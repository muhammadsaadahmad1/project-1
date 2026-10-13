import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("/node_modules/")) return;
          if (id.includes("/node_modules/@supabase/")) return "supabase";
          if (id.includes("/node_modules/lucide-react/")) return "icons";
          if (id.includes("/node_modules/react-router")) return "router";
          if (["react", "react-dom", "scheduler"].some(name => id.includes(`/node_modules/${name}/`))) return "react-vendor";
        }
      }
    }
  },
  server: {
    port: 5173,
    host: true
  }
});
