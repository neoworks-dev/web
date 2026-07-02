import tailwindcss from "@tailwindcss/vite";
import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

// Allow the Caddy-served base domain (dev: neoworks.localhost, prod: neoworks.dev).
const baseDomain = process.env.BASE_DOMAIN ?? "neoworks.localhost";

export default defineConfig({ plugins: [tailwindcss(), sveltekit()],
  server: {
    port: 5173,
    allowedHosts: [`.${baseDomain}`]
  }
});
