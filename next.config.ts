import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    // Exclude optional dependencies from bundle if not installed
    if (isServer) {
      // Server-side: make resend optional
      config.externals = [
        ...(Array.isArray(config.externals) ? config.externals : [config.externals || []]),
        { 'resend': 'commonjs resend' },
      ];
    } else {
      // Client-side: resend should not be bundled
      config.resolve.alias = {
        ...config.resolve.alias,
        resend: false,
      };
    }
    return config;
  },
};

export default nextConfig;
