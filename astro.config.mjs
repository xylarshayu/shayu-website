import { defineConfig } from 'astro/config';
import cloudflare from "@astrojs/cloudflare";
import tailwind from "@astrojs/tailwind";

import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  output: "server",
  vite: {
    build: {
      target: 'esnext'
    },
    esbuild: {
      target: 'esnext'
    },
    define: {
      global: 'globalThis'
    },
    optimizeDeps: {
      exclude: ['@block65/webcrypto-web-push']
    },
    ssr: {
      noExternal: ['@block65/webcrypto-web-push']
    }
  },
  adapter: cloudflare({
    platformProxy: {
      enabled: true
    }
  }),
  integrations: [tailwind({
    nesting: true
  }), svelte()],
});