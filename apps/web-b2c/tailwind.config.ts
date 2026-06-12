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
};

export default config;
