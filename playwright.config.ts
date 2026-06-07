import { defineConfig, devices } from '@playwright/test';

declare const process: {
    env: Record<string, string | undefined>;
};

const useSystemChrome = process.env.PLAYWRIGHT_USE_SYSTEM_CHROME === '1';
const isCI = process.env.CI === 'true';
const useExternalServer = process.env.PLAYWRIGHT_EXTERNAL_SERVER === '1';

export default defineConfig({
    testDir: './e2e',
    timeout: 30_000,
    fullyParallel: true,
    reporter: [['list']],
    use: {
        baseURL: 'http://127.0.0.1:4173',
        trace: 'on-first-retry'
    },
    webServer: useExternalServer
        ? undefined
        : {
              command: 'node ./node_modules/vite/bin/vite.js --host 127.0.0.1 --port 4173',
              url: 'http://127.0.0.1:4173',
              reuseExistingServer: !isCI,
              timeout: 60_000,
              gracefulShutdown: { signal: 'SIGTERM', timeout: 5_000 }
          },
    projects: [
        {
            name: useSystemChrome ? 'chrome' : 'chromium',
            use: {
                ...devices['Desktop Chrome'],
                ...(useSystemChrome ? { channel: 'chrome' } : {})
            }
        }
    ]
});
