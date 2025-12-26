import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      thresholds: {
        lines: 95,
        branches: 90,
        functions: 95,
        statements: 95,
      },
    },
    include: ['src/**/*.test.ts', 'src/**/*.test-d.ts'],
    typecheck: {
      enabled: true,
    },
  },
});
