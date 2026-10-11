const withMDX = require('@next/mdx')()

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true,
  experimental: {
    serverActions: { bodySizeLimit: '3mb' },
  },
}

module.exports = withMDX(nextConfig)
