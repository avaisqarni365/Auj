import type { Config } from 'tailwindcss';
import { aujPreset } from '@auj/ui/preset';

const config: Config = {
  darkMode: 'class',
  presets: [aujPreset as unknown as Partial<Config>],
  content: ['./app/**/*.{ts,tsx}', './src/**/*.{ts,tsx}', '../../packages/ui/src/**/*.{ts,tsx}'],
};

export default config;
