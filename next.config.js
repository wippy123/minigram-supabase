/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com'].filter(Boolean).map(url => new URL(url).hostname),
  },
  experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
  },
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...config.externals, 'chrome-aws-lambda'];
    }

    config.module.rules.push({
      test: /\.map$/,
      use: "ignore-loader"
    });

    return config;
  },
}

module.exports = nextConfig
