/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Get __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Apply browser globals polyfill
if (typeof global.self === 'undefined') global.self = global;
if (typeof global.window === 'undefined') global.window = global.self;
if (typeof global.document === 'undefined') {
  global.document = {
    createElement: () => ({
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      removeChild: () => {},
    }),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
  };
}
if (typeof global.navigator === 'undefined') {
  global.navigator = {
    userAgent: 'AutomatIQ/1.0 (Node.js)',
    language: 'en-US',
  };
}

const nextConfig = {
  // Output directory for the build
  distDir: 'dist',
  
  // Disable source maps in production
  productionBrowserSourceMaps: false,
  
  // Configure image optimization
  images: {
    domains: ['picsum.photos', 'source.unsplash.com', 'images.unsplash.com', 'via.placeholder.com'],
    formats: ['image/webp'],
    minimumCacheTTL: 60,
  },
  
  // Configure headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
    ];
  },
  
  // Configure webpack
  webpack: (config, { dev, isServer }) => {
    // Handle browser-only modules
    if (isServer) {
      config.externals = [...config.externals, {
        'puppeteer': 'commonjs puppeteer',
        'puppeteer-core': 'commonjs puppeteer-core',
        'resemblejs': 'commonjs resemblejs',
        'lighthouse': 'commonjs lighthouse',
        '@axe-core/puppeteer': 'commonjs @axe-core/puppeteer'
      }];
    }
    
    // Fix for 'self is not defined' error in client-side code
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
      };
    }
    
    // Add module aliases for browser-only modules
    config.resolve.alias = {
      ...config.resolve.alias,
      'puppeteer': isServer ? 'puppeteer' : path.resolve(__dirname, './lib/browser-module-shim.js'),
      'puppeteer-core': isServer ? 'puppeteer-core' : path.resolve(__dirname, './lib/browser-module-shim.js'),
      'resemblejs': isServer ? 'resemblejs' : path.resolve(__dirname, './lib/browser-module-shim.js'),
      'lighthouse': isServer ? 'lighthouse' : path.resolve(__dirname, './lib/browser-module-shim.js'),
      '@axe-core/puppeteer': isServer ? '@axe-core/puppeteer' : path.resolve(__dirname, './lib/browser-module-shim.js'),
    };
    
    return config;
  },
  
  skipMiddlewareUrlNormalize: true,
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

export default nextConfig;
