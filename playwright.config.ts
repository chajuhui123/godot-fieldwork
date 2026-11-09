import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/browser",
  timeout: 90000,
  use: {
    baseURL: "http://127.0.0.1:4319",
    launchOptions: {
      args: ["--enable-unsafe-swiftshader", "--use-angle=swiftshader"],
    },
  },
  webServer: {
    command: "npm run dev -- --port 4319",
    url: "http://127.0.0.1:4319",
    reuseExistingServer: !process.env.CI,
  },
});
