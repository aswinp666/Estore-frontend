/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['res.cloudinary.com'], // ✅ Cloudinary domain
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
