/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  // Development optimizations
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 86400, // Increase cache time to 24 hours
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    domains: ['localhost'], // Add explicit domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '',
      },
    ],
    // Only disable optimization in development
    unoptimized: process.env.NODE_ENV === 'development',
    // Add path prefix for better caching
    path: '/_next/image',
    // Reduce loader buffer size for better memory usage
    loaderFile: '',
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
  
  // Optimized webpack config for performance
  webpack: (config, { dev, isServer }) => {
    // Performance optimizations
    if (dev) {
      config.watchOptions = {
        poll: false,
        aggregateTimeout: 300,
        ignored: ['**/node_modules/**', '**/.git/**', '**/.next/**'],
      }
      
      // Reduce memory usage in development
      config.optimization = {
        ...config.optimization,
        removeAvailableModules: false,
        removeEmptyChunks: false,
        splitChunks: false,
      }

      // Use eval-source-map for better debugging without excessive build time
      config.devtool = 'eval-source-map';
    } else {
      // Production optimizations
      config.optimization.minimize = true;
      config.optimization.runtimeChunk = 'single';
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 20000,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              // Get the name. E.g. node_modules/packageName/not/this/part.js
              // or node_modules/packageName
              const packageName = module.context.match(/[\\/]node_modules[\\/]([^\\/]+)([\\/]|$)/)[1];
              // Create a clean package name for better readability in the browser
              return `npm.${packageName.replace('@', '')}`;
            },
          },
        },
      };
    }
    
    // Exclude problematic modules that cause bundling issues
    config.externals = config.externals || []
    if (isServer) {
      config.externals.push({
        'lighthouse': 'lighthouse',
        'puppeteer': 'puppeteer',
        '@axe-core/puppeteer': '@axe-core/puppeteer',
      })
    }
    
    // Handle ESM modules properly
    config.resolve.extensionAlias = {
      '.js': ['.js', '.ts'],
      '.jsx': ['.jsx', '.tsx'],
    }

    // Add module caching for faster builds
    config.cache = {
      type: 'filesystem',
      buildDependencies: {
        config: [import.meta.url], // Use import.meta.url instead of __filename in ESM
      },
      // No custom cacheDirectory to use default which is absolute
      maxAge: 604800000, // 1 week
    };

    // Optimize bundle size with better tree shaking
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any specific package aliases here if needed
    };
    
    // Add image optimization loader
    if (!isServer) {
      // Ensure we process image imports efficiently
      config.module.rules.push({
        test: /\.(png|jpe?g|gif|webp|avif)$/i,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8 * 1024, // 8kb - inline if smaller
          },
        },
      });
    }
    
    return config
  },
  
  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
      {
        source: '/_next/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/image(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
        ],
      },
      {
        source: '/images/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=86400, stale-while-revalidate=31536000',
          },
        ],
      },
      {
        source: '/fonts/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig