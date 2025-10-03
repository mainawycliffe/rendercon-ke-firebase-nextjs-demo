import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb', // Increase body size limit for image uploads
    },
  },
};

export default nextConfig;
