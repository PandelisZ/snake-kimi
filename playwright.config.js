const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  webServer: {
    command: 'npx http-server -p 8765 --silent -c-1',
    url: 'http://localhost:8765',
    reuseExistingServer: true,
    timeout: 5000,
  },
  use: {
    headless: true,
    baseURL: 'http://localhost:8765',
    viewport: { width: 1280, height: 720 },
    actionTimeout: 5000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { browserName: 'chromium' },
    },
  ],
});
