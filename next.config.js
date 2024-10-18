/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL].filter(Boolean).map(url => new URL(url).hostname),
  },
  // ... any other existing configurations
  webpack: (config, { isServer }) => {
    // Exclude source map files from chrome-aws-lambda
    config.module.rules.push({
      test: /\.js.map$/,
      use: ['ignore-loader'],
      include: /node_modules\/chrome-aws-lambda/,
    });

    if (isServer) {
      config.externals.push('chrome-aws-lambda');
    }

    return config;
  },
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig
