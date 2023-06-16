/* eslint-disable import/no-extraneous-dependencies */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
})
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone',
  webpack(config) {
    config.resolve.fallback = {
      ...config.resolve.fallback, 
      fs: false, 
      path: false
    };

    return config;
  },
}

module.exports = withPWA(nextConfig)