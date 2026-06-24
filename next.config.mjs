/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['puppeteer', 'whatsapp-web.js', 'qrcode']
  }
};

export default nextConfig;
