import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["src/**/*.test.ts"],
    environment: "node",
    env: {
      NODE_ENV: "test",
      LITELLM_BASE_URL: "https://litellm.test",
      LITELLM_ADMIN_KEY: "admin-secret-never-returned",
      SESSION_ENCRYPTION_KEY: "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef",
      INTERNAL_API_SECRET: "internal-test-secret-long-enough",
      FRONTEND_ORIGIN: "http://localhost:3000",
    },
  },
});
