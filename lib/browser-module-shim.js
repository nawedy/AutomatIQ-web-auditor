// lib/browser-module-shim.js
// This module provides shims for browser-specific modules during server-side rendering

// Ensure browser globals are defined
if (typeof global !== 'undefined') {
  // Define self first as it's referenced by other globals
  if (typeof global.self === 'undefined') {
    global.self = global;
  }

  // Define window
  if (typeof global.window === 'undefined') {
    global.window = global.self;
  }

  // Define document with minimal implementation
  if (typeof global.document === 'undefined') {
    global.document = {
      createElement: () => ({
        style: {},
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: () => {},
        removeChild: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }),
      }),
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => [],
      documentElement: { style: {} },
      body: { appendChild: () => {}, removeChild: () => {} },
    };
  }

  // Define navigator
  if (typeof global.navigator === 'undefined') {
    global.navigator = {
      userAgent: 'AutomatIQ/1.0 (Node.js)',
      language: 'en-US',
      platform: process.platform,
    };
  }

  // Define globalThis
  if (typeof global.globalThis === 'undefined') {
    global.globalThis = global;
  }
}

// Create a proxy handler for browser-specific modules
const createProxyHandler = (moduleName) => ({
  get: (target, prop) => {
    // Handle special cases for specific modules
    if (moduleName === 'puppeteer' && prop === 'launch') {
      return () => Promise.resolve({
        newPage: () => Promise.resolve({
          goto: () => Promise.resolve({}),
          screenshot: () => Promise.resolve(Buffer.from('')),
          evaluate: () => Promise.resolve({}),
          close: () => Promise.resolve({}),
        }),
        close: () => Promise.resolve({}),
      });
    }
    
    if (moduleName === 'resemblejs' && prop === 'compare') {
      return () => Promise.resolve({
        data: {
          misMatchPercentage: 0,
          isSameDimensions: true,
          dimensionDifference: { width: 0, height: 0 },
          analysisTime: 0,
        },
      });
    }
    
    if (moduleName === 'lighthouse' && prop === 'lighthouse') {
      return () => Promise.resolve({
        lhr: {
          categories: {
            performance: { score: 1 },
            accessibility: { score: 1 },
            'best-practices': { score: 1 },
            seo: { score: 1 },
          },
        },
      });
    }
    
    // Default behavior for other properties
    if (typeof target[prop] === 'function') {
      return (...args) => {
        console.log(`[Browser Module Shim] ${moduleName}.${prop} called with args:`, args);
        return Promise.resolve({});
      };
    }
    
    if (prop === 'then' || prop === 'catch' || prop === 'finally') {
      return undefined; // Make the object not thenable
    }
    
    return new Proxy({}, createProxyHandler(`${moduleName}.${prop}`));
  },
});

// Create mock modules
const createMockModule = (name) => {
  return new Proxy({}, createProxyHandler(name));
};

// Export mock modules
module.exports = {
  puppeteer: createMockModule('puppeteer'),
  resemblejs: createMockModule('resemblejs'),
  lighthouse: createMockModule('lighthouse'),
  '@axe-core/puppeteer': createMockModule('@axe-core/puppeteer'),
  
  // Export a function to verify the shim is working
  verifyShim: () => {
    return {
      self: typeof self !== 'undefined',
      window: typeof window !== 'undefined',
      document: typeof document !== 'undefined',
      navigator: typeof navigator !== 'undefined',
      globalThis: typeof globalThis !== 'undefined',
    };
  }
};
