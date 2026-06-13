import type { Config } from 'tailwindcss';
import { aujPreset } from '@auj/ui/preset';

const config: Config = {
  darkMode: 'class',
  presets: [aujPreset as unknown as Partial<Config>],
  content: [
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
    // Scan the shared component library so its utility classes are generated.
    '../../packages/ui/src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        serif: ['var(--font-serif)', 'Georgia', 'serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
        arabic: ['var(--font-arabic)', 'sans-serif'],
      },
    },
  },
};

export default config;
