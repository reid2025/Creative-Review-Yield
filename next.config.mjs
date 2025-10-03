/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable faster dev reload
  experimental: {
    turbo: {},
  },
  // Hot reload optimization
  // Fast refresh configuration
  compiler: {
    removeConsole: false,
  },
}

export default nextConfig
