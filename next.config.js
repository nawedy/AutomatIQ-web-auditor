/** @type {import('next').NextConfig} */
const webpack = require('webpack');

const nextConfig = {
  reactStrictMode: true,
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  webpack: (config, { isServer, dev }) => {
    // Apply polyfills for browser globals in client-side code
    if (!isServer) {
      // Provide polyfills for browser APIs
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: require.resolve('crypto-browserify'),
        stream: require.resolve('stream-browserify'),
        url: require.resolve('url'),
        zlib: require.resolve('browserify-zlib'),
        http: require.resolve('stream-http'),
        https: require.resolve('https-browserify'),
        assert: require.resolve('assert'),
        os: require.resolve('os-browserify'),
        path: require.resolve('path-browserify'),
        'process/browser': require.resolve('process/browser'),
      };
      
      // Define global variables for client-side
      config.plugins.push(
        new webpack.DefinePlugin({
          'process.env.BROWSER': JSON.stringify(true),
        })
      );
    }
    
    // Handle server-only modules
    if (isServer) {
      // For server-side, exclude problematic packages from bundling
      config.externals = [
        ...(config.externals || []),
        'lighthouse',
        'puppeteer',
        'chrome-launcher',
        'puppeteer-core',
      ];
    } else {
      // For client-side, provide empty modules for server-only packages
      config.resolve.alias = {
        ...config.resolve.alias,
        'lighthouse': false,
        'puppeteer': false,
        'chrome-launcher': false,
        'puppeteer-core': false,
      };
    }
    
    return config;
  },
  // Exclude specific packages from bundling
  serverExternalPackages: ['lighthouse', 'puppeteer', 'chrome-launcher', 'puppeteer-core'],
  
  // Disable static generation for API routes that use server-only modules
  outputFileTracingExcludes: {
    '/api/advanced-audits/**': ['**/node_modules/lighthouse/**', '**/node_modules/puppeteer/**', '**/node_modules/chrome-launcher/**'],
    '/api/audits/**': ['**/node_modules/lighthouse/**', '**/node_modules/puppeteer/**', '**/node_modules/chrome-launcher/**'],
  },
  // Disable static optimization for API routes that use server-only modules
  excludeDefaultMomentLocales: true,
  poweredByHeader: false,
};

module.exports = nextConfig;
