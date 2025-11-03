/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
  webpack: (config) => {
    // Handle canvas package for pdf-parse
    config.resolve.alias.canvas = false;
    return config;
  },
};

export default nextConfig;
