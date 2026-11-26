import { defineConfig } from '@playwright/test';

// Tests run against the production build (`npm run build` first).
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  use: { baseURL: 'http://127.0.0.1:4322', channel: 'chrome' },
  webServer: { command: 'npx astro preview --host 127.0.0.1 --port 4322', url: 'http://127.0.0.1:4322', reuseExistingServer: !process.env.CI },
  reporter: [['list']],
});
