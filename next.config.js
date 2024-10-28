/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [process.env.NEXT_PUBLIC_SUPABASE_URL, 'https://hebbkx1anhila5yf.public.blob.vercel-storage.com'].filter(Boolean).map(url => new URL(url).hostname),
  },
}

module.exports = nextConfig
