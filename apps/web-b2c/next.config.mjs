import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Slim, self-contained server output for Docker.
  output: 'standalone',
  // Trace from the monorepo root so workspace packages are bundled into standalone.
  outputFileTracingRoot: path.join(dirname, '../../'),
  // Compile the workspace packages from source (no prebuilt dist needed for the app).
  transpilePackages: [
    '@auj/ui',
    '@auj/contracts',
    '@auj/core-booking',
    '@auj/payments',
    '@auj/visa-router',
    '@auj/connector-mock',
  ],
  // Keep node-postgres external (it has dynamic requires); the tracer still bundles it.
  experimental: {
    serverComponentsExternalPackages: ['pg'],
  },
  // Linting + typechecking run in the turbo gate, not during next build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
