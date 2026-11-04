import { defineConfig } from '@playwright/test';

// Tests run against the production build (`npm run build` first).
export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  use: { baseURL: 'http://localhost:4322', channel: 'chrome' },
  webServer: { command: 'npx astro preview --port 4322', url: 'http://localhost:4322', reuseExistingServer: !process.env.CI },
  reporter: [['list']],
});
