import { defineConfig } from 'vitest/config';

// The app's tsconfig.json is Next's (jsx: preserve). Vitest must still transform
// JSX itself for the component tests, so force the automatic runtime here.
export default defineConfig({
  esbuild: { jsx: 'automatic' },
});
