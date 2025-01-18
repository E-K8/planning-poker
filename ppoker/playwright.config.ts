import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  timeout: 30 * 1000,
  use: {
    headless: true,
    baseURL: 'http://localhost:3001',
  },
  webServer: {
    command: 'npm run dev',
    port: 3001,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI, // avoid restarting in local development
  },
});
