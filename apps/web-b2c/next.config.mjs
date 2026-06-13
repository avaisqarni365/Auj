import path from 'node:path';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Slim, self-contained server output for Docker.
  output: 'standalone',
  // Compile the workspace packages from source (no prebuilt dist needed for the app).
  transpilePackages: [
    '@auj/ui',
    '@auj/contracts',
    '@auj/core-booking',
    '@auj/payments',
    '@auj/visa-router',
    '@auj/connector-mock',
  ],
  experimental: {
    // Trace from the monorepo root so workspace packages are bundled into standalone.
    // (In Next 14 this lives under `experimental`, not top-level.)
    outputFileTracingRoot: path.join(dirname, '../../'),
    // Keep node-postgres external (it has dynamic requires); the tracer still bundles it.
    serverComponentsExternalPackages: ['pg'],
  },
  // Linting + typechecking run in the turbo gate, not during next build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
