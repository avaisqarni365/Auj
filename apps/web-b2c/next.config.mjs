/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Compile the workspace packages from source (no prebuilt dist needed for the app).
  transpilePackages: [
    '@auj/ui',
    '@auj/contracts',
    '@auj/core-booking',
    '@auj/payments',
    '@auj/visa-router',
    '@auj/connector-mock',
  ],
  // Linting + typechecking run in the turbo gate, not during next build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
