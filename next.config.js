/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL].filter(Boolean).map(url => new URL(url).hostname),
  },
  experimental: {
    serverComponentsExternalPackages: ['puppeteer-core'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals.push('puppeteer-core');
    }
    return config;
  },
}

module.exports = nextConfig
