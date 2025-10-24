/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // This is required to allow the development environment to work correctly.
    allowedDevOrigins: [
      "https://9000-firebase-studio-1748527364540.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
