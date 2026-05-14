import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['netlify/**/*.test.mts'],
    environment: 'node',
  },
});
