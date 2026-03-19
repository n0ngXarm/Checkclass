/** @type {import('next').NextConfig} */
const nextConfig = {
  // API base URL — override in production via NEXT_PUBLIC_API_URL env var
  async rewrites() {
    return [
      {
        source: '/api/php/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost/attendance_system'}/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
