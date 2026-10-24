import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'vitest/config';

// Override, so a DATABASE_URL already set in the shell can never point tests at dev.
loadEnv({ path: '.env.test', override: true, quiet: true });

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['tests/setup.ts'],
    globalSetup: ['tests/global-setup.ts'],
    // All integration tests share one database schema, so files must not run concurrently.
    fileParallelism: false,
    // The database is remote (Supabase), so queries are slower than a local one.
    testTimeout: 20000,
    coverage: {
      provider: 'v8',
      include: ['src/**'],
      exclude: ['src/server.ts'],
    },
  },
});
