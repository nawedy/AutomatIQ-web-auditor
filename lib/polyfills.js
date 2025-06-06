// lib/polyfills.js
// This file provides polyfills for browser globals in any environment

// Define self first as it's often referenced by other globals
if (typeof self === 'undefined' && typeof global !== 'undefined') {
  // In Node.js environment
  global.self = global;
}

// Define window if needed
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  global.window = global.self;
}

// Define document if needed
if (typeof document === 'undefined' && typeof global !== 'undefined') {
  global.document = {
    createElement: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
  };
}

// Define navigator if needed
if (typeof navigator === 'undefined' && typeof global !== 'undefined') {
  global.navigator = {
    userAgent: 'AutomatIQ/1.0',
    language: 'en-US',
  };
}

// Define globalThis for modern code
if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
  global.globalThis = global;
}

// Export a function to verify polyfills are working
export function verifyPolyfills() {
  const hasWindow = typeof window !== 'undefined';
  const hasSelf = typeof self !== 'undefined';
  const hasDocument = typeof document !== 'undefined';
  const hasNavigator = typeof navigator !== 'undefined';
  const hasGlobalThis = typeof globalThis !== 'undefined';
  
  return {
    hasWindow,
    hasSelf,
    hasDocument,
    hasNavigator,
    hasGlobalThis,
    allDefined: hasWindow && hasSelf && hasDocument && hasNavigator && hasGlobalThis
  };
}
