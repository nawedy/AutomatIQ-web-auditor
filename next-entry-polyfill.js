// next-entry-polyfill.js
// This file is used as a custom entry point for Next.js to ensure browser globals are defined

// Apply critical polyfills immediately
console.log('[AutomatIQ] Applying entry point polyfills...');

// Define self
if (typeof self === 'undefined' && typeof global !== 'undefined') {
  global.self = global;
  console.log('[AutomatIQ] ✅ Defined self');
}

// Define window
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  global.window = global.self;
  console.log('[AutomatIQ] ✅ Defined window');
}

// Define globalThis
if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
  global.globalThis = global;
  console.log('[AutomatIQ] ✅ Defined globalThis');
}

// Define document with minimal implementation
if (typeof document === 'undefined' && typeof global !== 'undefined') {
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
  console.log('[AutomatIQ] ✅ Defined document');
}

// Define navigator
if (typeof navigator === 'undefined' && typeof global !== 'undefined') {
  global.navigator = {
    userAgent: 'AutomatIQ/1.0 (Node.js)',
    language: 'en-US',
    platform: process.platform,
  };
  console.log('[AutomatIQ] ✅ Defined navigator');
}

// Define location
if (typeof location === 'undefined' && typeof global !== 'undefined') {
  global.location = {
    href: 'https://automatiq.local',
    origin: 'https://automatiq.local',
    protocol: 'https:',
    host: 'automatiq.local',
    hostname: 'automatiq.local',
    port: '',
    pathname: '/',
    search: '',
    hash: '',
  };
  console.log('[AutomatIQ] ✅ Defined location');
}

// Define URL if it doesn't exist
if (typeof URL === 'undefined' && typeof global !== 'undefined') {
  global.URL = require('url').URL;
  console.log('[AutomatIQ] ✅ Defined URL');
}

// Define URLSearchParams if it doesn't exist
if (typeof URLSearchParams === 'undefined' && typeof global !== 'undefined') {
  global.URLSearchParams = require('url').URLSearchParams;
  console.log('[AutomatIQ] ✅ Defined URLSearchParams');
}

// Define performance if it doesn't exist
if (typeof performance === 'undefined' && typeof global !== 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    getEntries: () => [],
  };
  console.log('[AutomatIQ] ✅ Defined performance');
}

// Define history if it doesn't exist
if (typeof history === 'undefined' && typeof global !== 'undefined') {
  global.history = {
    pushState: () => {},
    replaceState: () => {},
    go: () => {},
    back: () => {},
    forward: () => {},
    length: 1,
    state: null,
  };
  console.log('[AutomatIQ] ✅ Defined history');
}

// Define localStorage if it doesn't exist
if (typeof localStorage === 'undefined' && typeof global !== 'undefined') {
  global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
  console.log('[AutomatIQ] ✅ Defined localStorage');
}

// Define sessionStorage if it doesn't exist
if (typeof sessionStorage === 'undefined' && typeof global !== 'undefined') {
  global.sessionStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
    key: () => null,
    length: 0,
  };
  console.log('[AutomatIQ] ✅ Defined sessionStorage');
}

// Verify polyfills
const verifyPolyfills = () => {
  const checks = {
    self: typeof self !== 'undefined',
    window: typeof window !== 'undefined',
    document: typeof document !== 'undefined',
    navigator: typeof navigator !== 'undefined',
    globalThis: typeof globalThis !== 'undefined',
    location: typeof location !== 'undefined',
    URL: typeof URL !== 'undefined',
    URLSearchParams: typeof URLSearchParams !== 'undefined',
    performance: typeof performance !== 'undefined',
    history: typeof history !== 'undefined',
    localStorage: typeof localStorage !== 'undefined',
    sessionStorage: typeof sessionStorage !== 'undefined',
  };
  
  console.log('\n[AutomatIQ] Polyfill verification:');
  Object.entries(checks).forEach(([name, exists]) => {
    console.log(`[AutomatIQ] - ${name}: ${exists ? '✅' : '❌'}`);
  });
  
  const allDefined = Object.values(checks).every(Boolean);
  console.log(`\n[AutomatIQ] All polyfills ${allDefined ? '✅ successfully applied' : '❌ failed to apply'}\n`);
  
  return allDefined;
};

// Run verification
verifyPolyfills();

// Now require the actual Next.js entry point
console.log('[AutomatIQ] Loading Next.js...');
module.exports = require('next');
