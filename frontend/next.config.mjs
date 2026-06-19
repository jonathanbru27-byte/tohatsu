/** @type {import('next').NextConfig} */
const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.EXPO_PUBLIC_BACKEND_URL;

const nextConfig = {
  reactStrictMode: false,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: 'localhost' },
    ],
    // Allow base64 data URIs - we render them via <img> rather than next/image for simplicity
  },
  async rewrites() {
    if (!backendBase) return [];
    return [
      {
        source: '/api/:path*',
        destination: `${backendBase}/api/:path*`,
      },
    ];
  },
  // Static asset headers for the service worker
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=0, must-revalidate' },
          { key: 'Service-Worker-Allowed', value: '/' },
        ],
      },
      {
        source: '/manifest.json',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=3600' }],
      },
    ];
  },
};

export default nextConfig;
