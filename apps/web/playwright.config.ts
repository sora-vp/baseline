import { defineConfig, devices } from "@playwright/test";

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
// require('dotenv').config();

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: "./e2e",
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: "html",
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL: "http://localhost:9999",

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: "on-first-retry",
  },

  /* Configure projects for major browsers */
  projects: [
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
    },
    {
      name: "chromium",
      grep: /.*spec.ts/,
      grepInvert: /.*test.ts/,
      use: {
        ...devices["Desktop Chrome"],
        storageState: "e2e/.auth/storageState.json",
      },
      dependencies: ["setup"],
    },

    // {
    //   name: "firefox",
    //   grep: /.*spec.ts/,
    //   grepInvert: /.*test.ts/,
    //   use: {
    //     ...devices["Desktop Firefox"],
    //     storageState: "e2e/.auth/storageState.json",
    //   },
    //   dependencies: ["setup"],
    // },
    // {
    //   name: "webkit",
    //   grep: /.*spec.ts/,
    //   grepInvert: /.*test.ts/,
    //   use: {
    //     ...devices["Desktop Safari"],
    //     storageState: "e2e/.auth/storageState.json",
    //   },
    //   dependencies: ["setup"],
    // },

    // Before login test
    {
      name: "chromium - before login",
      testMatch: "beforeLogin.test.ts",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox - before login",
      testMatch: "beforeLogin.test.ts",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
    {
      name: "webkit - before login",
      testMatch: "beforeLogin.test.ts",
      use: {
        ...devices["Desktop Safari"],
      },
    },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ..devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests */
  webServer: {
    command: "yarn start -p 9999",
    url: "http://127.0.0.1:9999",
    reuseExistingServer: !process.env.CI,
  },
});
