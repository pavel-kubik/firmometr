import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: 'http://localhost:4201',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: [
    {
      command: 'ng serve --port 4201',
      url: 'http://localhost:4201',
      reuseExistingServer: !process.env['CI'],
      timeout: 120_000,
    },
    {
      command: 'wrangler pages dev --proxy 4201 --port 8889 --compatibility-date=2024-01-01 --log-level=warn',
      url: 'http://localhost:8889',
      reuseExistingServer: !process.env['CI'],
      timeout: 60_000,
    },
  ],
});
