const withMDX = require('@next/mdx')()

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  async redirects() {
    return ['korea', 'taiwan', 'singapore'].map((destination) => ({
      source: `/${destination}`,
      destination: `/travel?destination=${destination}`,
      permanent: true,
    }));
  },
  experimental: {
    serverActions: { bodySizeLimit: '3mb' },
  },
}

module.exports = withMDX(nextConfig)
