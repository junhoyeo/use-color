import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html'],
      exclude: [
        // Barrel files (just re-exports, no logic to test)
        '**/index.ts',
        // Type definition files
        '**/*.d.ts',
        '**/*.test.ts',
        '**/*.test-d.ts',
        '**/types/*.ts',
      ],
      thresholds: {
        lines: 95,
        branches: 89,
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
