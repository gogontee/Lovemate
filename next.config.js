module.exports = {
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
  },
};