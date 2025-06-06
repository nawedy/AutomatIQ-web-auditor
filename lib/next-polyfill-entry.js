// lib/next-polyfill-entry.js
// This file serves as a custom entry point for Next.js to ensure polyfills are loaded first

// Apply critical polyfills immediately
if (typeof self === 'undefined' && typeof global !== 'undefined') {
  global.self = global;
  console.log('[AutomatIQ] Self polyfill applied');
}

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  global.window = global.self;
  console.log('[AutomatIQ] Window polyfill applied');
}

if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
  global.globalThis = global;
  console.log('[AutomatIQ] GlobalThis polyfill applied');
}

// Load the rest of the polyfills
require('./global-polyfills');

// Export a function to be used in webpack configuration
module.exports = function() {
  return {
    name: 'next-polyfill-entry',
    setup() {
      console.log('[AutomatIQ] Polyfill entry point loaded');
    }
  };
};
