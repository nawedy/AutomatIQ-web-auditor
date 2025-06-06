// lib/module-resolver.js
// This file is used to resolve modules during build time

const path = require('path');
const fs = require('fs');

// Check if we're in a production build environment
const isProductionBuild = process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build';

// List of modules to mock during server-side rendering
const modulesToMock = {
  './services/advanced-cross-browser-analyzer': './services/mock-cross-browser-analyzer',
};

// Export a function that Next.js can use to resolve modules
module.exports = function resolveModulePath(request, options) {
  // Only intercept imports during production build
  if (isProductionBuild) {
    // Check if this is a module we want to mock
    const mockPath = modulesToMock[request];
    if (mockPath) {
      // Resolve to the mock implementation
      return path.resolve(__dirname, mockPath);
    }
  }
  
  // Otherwise, use the default resolver
  return options.defaultResolver(request, options);
};
