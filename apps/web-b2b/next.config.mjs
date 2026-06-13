import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: [
    '@auj/ui',
    '@auj/contracts',
    '@auj/core-booking',
    '@auj/payments',
    '@auj/visa-router',
    '@auj/connector-mock',
  ],
  experimental: {
    outputFileTracingRoot: path.join(dirname, '../../'),
    serverComponentsExternalPackages: ['pg'],
  },
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
