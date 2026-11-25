import { defineConfig } from 'vite';

const buildId = process.env.GITHUB_SHA || 'local';

export default defineConfig({
  define: { __APP_BUILD_ID__: JSON.stringify(buildId) },
  plugins: [{ name: 'site-version', generateBundle() { this.emitFile({ type: 'asset', fileName: 'version.json', source: JSON.stringify({ version: buildId }) }); } }],
  base: process.env.GITHUB_PAGES === 'true' ? '/AERO-MIST/' : '/',
  server: { host: '0.0.0.0', allowedHosts: ['.e2b.app', '.app.github.dev'] },
  preview: { host: '0.0.0.0', allowedHosts: ['.e2b.app', '.app.github.dev'] },
});
