import { defineConfig } from 'vitest/config';

// tsconfig.json is Next's (jsx: preserve); force the automatic JSX runtime for tests.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
});
