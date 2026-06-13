import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@auj/ui', '@auj/contracts', '@auj/visa-router', '@auj/auth', '@auj/core-booking', '@auj/connector-mock', '@auj/connector-travel', '@auj/payments'],
  experimental: {
    outputFileTracingRoot: path.join(dirname, '../../'),
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
