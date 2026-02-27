import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  timeout: 30_000,
  retries: 1,
  use: {
    viewport: { width: 900, height: 800 },
  },
  projects: [
    {
      name: "chromium",
      use: { browserName: "chromium" },
    },
  ],
});
