import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Repositioning: /schools index now points at the schools partnership
      // page. 307 (temporary) keeps shared links alive without permanently
      // caching while positioning settles. /schools/[slug] is unaffected.
      {
        source: '/schools',
        destination: '/for-schools',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
