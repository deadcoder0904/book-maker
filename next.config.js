/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  rewrites: async () => {
    return [
      {
        source: '/',
        destination: '/index.html',
      },
    ]
  },
}

module.exports = nextConfig
