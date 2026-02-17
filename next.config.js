/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pztuwangpzlzrihblnta.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
    ],
    minimumCacheTTL: 86400,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'],
  },
  staticPageGenerationTimeout: 180,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Turbopack is now a top-level option, NOT inside experimental
  turbopack: {
    resolveAlias: {
      // Add any aliases here if needed
      // Example: '@': path.join(__dirname, 'src'),
    },
    // You can add other Turbopack-specific options here
    // loaders: { ... },
  },
};

module.exports = nextConfig;