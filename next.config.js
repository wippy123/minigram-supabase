/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL].filter(Boolean).map(url => new URL(url).hostname),
  },
  // ... any other existing configurations
}

module.exports = nextConfig
