import type { NextConfig } from 'next';
// import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    unoptimized: true,
  },
};

// initOpenNextCloudflareForDev();

export default nextConfig;
