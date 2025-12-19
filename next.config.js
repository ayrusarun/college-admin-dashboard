/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  experimental: {
    turbo: {
      root: '/app',
    },
  },
};

module.exports = nextConfig;
