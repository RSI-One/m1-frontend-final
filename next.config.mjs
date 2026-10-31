/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/backend/:path*',
        destination: 'http://127.0.0.1:8000/:path*',
      },
      {
        source: '/admin/general',
        destination: '/admin',
      },
      {
        source: '/admin/customer-care',
        destination: '/admin',
      },
      {
        source: '/admin/bd',
        destination: '/admin',
      },
      {
        source: '/admin/executive',
        destination: '/admin',
      },
      {
        source: '/admin/tech',
        destination: '/admin',
      },
    ];
  },
};

export default nextConfig;
