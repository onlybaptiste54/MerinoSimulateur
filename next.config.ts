import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // Turbopack par défaut en Next 16 - config vide pour éviter le warning webpack
  turbopack: {},

  // Optimisations production
  compress: true,

  // Réduire la RAM - optimiser les chunks
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },

  // Optimiser les images (si ajoutées plus tard)
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60,
  },

  // Headers de sécurité et performance
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },

  // Build production
  output: 'standalone',
};

export default nextConfig;
