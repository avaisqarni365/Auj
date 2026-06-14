import path from 'node:path';
import { fileURLToPath } from 'node:url';
import createNextIntlPlugin from 'next-intl/plugin';

const dirname = path.dirname(fileURLToPath(import.meta.url));
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  transpilePackages: ['@auj/ui', '@auj/contracts', '@auj/visa-router', '@auj/auth', '@auj/core-booking', '@auj/connector-mock', '@auj/connector-saudi', '@auj/connector-travel', '@auj/payments', '@auj/support', '@auj/notifications'],
  experimental: {
    outputFileTracingRoot: path.join(dirname, '../../'),
  },
  eslint: { ignoreDuringBuilds: true },
};

export default withNextIntl(nextConfig);
