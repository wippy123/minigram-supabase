/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['hebbkx1anhila5yf.public.blob.vercel-storage.com', 'bfpsgywgokbcnmftdbqc.supabase.co']
  },
   experimental: {
    serverComponentsExternalPackages: ['@sparticuz/chromium'],
   }
}

module.exports = nextConfig
