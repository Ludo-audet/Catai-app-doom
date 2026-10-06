import { defineConfig, devices } from '@playwright/test';

const chromium = process.env.CATAI_CHROMIUM ? { launchOptions: { executablePath: process.env.CATAI_CHROMIUM } } : {};

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  reporter: [['list']],
  use: { baseURL: 'http://localhost:4173/', ...chromium },
  webServer: { command: 'node scripts/serve.mjs', env: { PORT: '4173' }, url: 'http://localhost:4173/', reuseExistingServer: true },
  projects: [
    { name: 'mobile', use: { ...devices['Pixel 7'], ...chromium } },
    { name: 'ordinateur', use: { viewport: { width: 1280, height: 800 }, ...chromium } },
  ],
});
