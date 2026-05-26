import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['functions/**/*.test.ts', 'workers/**/*.test.ts'],
    environment: 'node',
    coverage: {
      provider: 'v8',
      include: ['functions/**/*.ts', 'workers/**/*.ts'],
      exclude: ['**/*.test.ts'],
      thresholds: { lines: 80 },
    },
  },
});
