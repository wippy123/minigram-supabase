/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL.replace('https://', '')],
  },
  // ... any other existing configurations
}

module.exports = nextConfig
