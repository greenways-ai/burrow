/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  webpack: (config, { isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
      encoding: false,
      'pino-pretty': false,
      lokijs: false,
    };
    
    // Add raw-loader for .md files
    config.module.rules.push({
      test: /\.md$/,
      type: 'asset/source',
    });
    
    // Exclude browser-only modules from server bundle
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push(
        '@wagmi/connectors',
        '@rainbow-me/rainbowkit',
        'wagmi'
      );
    }
    
    return config;
  },
};

module.exports = nextConfig;
