import { defineConfig } from 'vite';

export default defineConfig({
  base: process.env.GITHUB_PAGES === 'true' ? '/AERO-MIST/' : '/',
  server: { host: '0.0.0.0', allowedHosts: ['.e2b.app', '.app.github.dev'] },
  preview: { host: '0.0.0.0', allowedHosts: ['.e2b.app', '.app.github.dev'] },
});
