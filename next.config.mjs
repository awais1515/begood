/** @type {import('next').NextConfig} */
const nextConfig = {
  assetPrefix: process.env.NODE_ENV === 'development' ? '' : undefined,
  experimental: {
    allowedDevOrigins: [
      "https://9000-firebase-studio-1748527364540.cluster-oayqgyglpfgseqclbygurw4xd4.cloudworkstations.dev",
    ],
  },
};

export default nextConfig;
