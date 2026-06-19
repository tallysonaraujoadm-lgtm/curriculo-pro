import { resolve } from "node:path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, "index.html"),
        resetPassword: resolve(import.meta.dirname, "reset-password.html"),
        privacy: resolve(import.meta.dirname, "privacy.html"),
        terms: resolve(import.meta.dirname, "terms.html")
      }
    }
  }
});
