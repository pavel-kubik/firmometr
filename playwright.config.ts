import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env['CI'];

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  retries: 0,
  use: {
    baseURL: isCI ? 'http://localhost:8889' : 'http://localhost:4201',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: isCI
    ? [{
        command: 'wrangler pages dev dist/firmometr-ui/browser --port 8889 --compatibility-date=2024-01-01 --log-level=warn',
        url: 'http://localhost:8889',
        reuseExistingServer: false,
        timeout: 60_000,
      }]
    : [
        {
          command: 'ng serve --port 4201',
          url: 'http://localhost:4201',
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: 'wrangler pages dev --proxy 4201 --port 8889 --compatibility-date=2024-01-01 --log-level=warn',
          url: 'http://localhost:8889',
          reuseExistingServer: true,
          timeout: 180_000,
        },
      ],
});
