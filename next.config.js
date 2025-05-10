/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      domains: ['res.cloudinary.com'], // Add Cloudinary domain here
    },
  };
  
  module.exports = {
  eslint: {
    ignoreDuringBuilds: true,
  },
};