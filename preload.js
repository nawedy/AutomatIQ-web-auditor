// preload.js
// This file is executed before any other code in the application
// It ensures that browser globals are available in all environments

// Define self first as it's the root of many other globals
if (typeof self === 'undefined' && typeof global !== 'undefined') {
  global.self = global;
  console.log('[AutomatIQ] Preload: self defined as global');
}

// Define window if needed
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  global.window = global.self;
  console.log('[AutomatIQ] Preload: window defined as self');
}

// Define document with minimal implementation
if (typeof document === 'undefined' && typeof global !== 'undefined') {
  global.document = {
    createElement: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
  };
  console.log('[AutomatIQ] Preload: document defined with minimal implementation');
}

// Define navigator with minimal implementation
if (typeof navigator === 'undefined' && typeof global !== 'undefined') {
  global.navigator = {
    userAgent: 'AutomatIQ/1.0',
    language: 'en-US',
  };
  console.log('[AutomatIQ] Preload: navigator defined with minimal implementation');
}

// Define globalThis for modern code
if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
  global.globalThis = global;
  console.log('[AutomatIQ] Preload: globalThis defined as global');
}

// Export a verification function
module.exports = {
  verify: function() {
    return {
      self: typeof self !== 'undefined',
      window: typeof window !== 'undefined',
      document: typeof document !== 'undefined',
      navigator: typeof navigator !== 'undefined',
      globalThis: typeof globalThis !== 'undefined'
    };
  }
};
