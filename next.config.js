const withMDX = require('@next/mdx')()

const nextConfig = {
  pageExtensions: ['js', 'jsx', 'mdx', 'ts', 'tsx'],
  reactStrictMode: true
}

module.exports = withMDX(nextConfig)