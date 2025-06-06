// lib/global-polyfills.js
// Global polyfills for browser objects in Node.js environment
// This file is imported at the entry point of the application

// Self polyfill - must be first as other globals may reference it
if (typeof global !== 'undefined' && typeof self === 'undefined') {
  // Define self as global in Node.js environment
  global.self = global;
  console.log('✅ Self polyfill applied');
}

// Window polyfill
if (typeof global !== 'undefined' && typeof window === 'undefined') {
  global.window = global.self;
  console.log('✅ Window polyfill applied');
}

// Document polyfill with comprehensive mock implementation
if (typeof global !== 'undefined' && typeof document === 'undefined') {
  global.document = {
    createElement: (tag) => ({
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      classList: {
        add: () => {},
        remove: () => {},
        toggle: () => {},
        contains: () => false
      },
      getBoundingClientRect: () => ({ 
        top: 0, left: 0, bottom: 0, right: 0, 
        width: 0, height: 0, x: 0, y: 0 
      }),
      tagName: tag?.toUpperCase() || 'DIV'
    }),
    createTextNode: (text) => ({ nodeValue: text }),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
    documentElement: { 
      style: {}, 
      clientWidth: 1920, 
      clientHeight: 1080,
      scrollTop: 0,
      scrollLeft: 0
    },
    head: { appendChild: () => {}, removeChild: () => {} },
    body: { 
      appendChild: () => {}, 
      removeChild: () => {},
      style: {},
      clientWidth: 1920,
      clientHeight: 1080
    },
    location: { 
      href: 'https://example.com',
      protocol: 'https:',
      host: 'example.com',
      hostname: 'example.com',
      pathname: '/',
      search: '',
      hash: ''
    },
    cookie: '',
    readyState: 'complete',
    implementation: {
      createHTMLDocument: (title) => global.document
    },
    createRange: () => ({
      setStart: () => {},
      setEnd: () => {},
      selectNode: () => {},
      selectNodeContents: () => {},
      commonAncestorContainer: {}
    })
  };
  console.log('✅ Document polyfill applied');
}

// Navigator polyfill
if (typeof global !== 'undefined' && typeof navigator === 'undefined') {
  global.navigator = {
    userAgent: 'Mozilla/5.0 (Node.js) AutomatIQ/1.0',
    language: 'en-US',
    languages: ['en-US', 'en'],
    platform: process.platform,
    vendor: 'Node.js',
    appName: 'AutomatIQ',
    appVersion: '1.0.0',
    onLine: true,
    cookieEnabled: true,
    hardwareConcurrency: 4,
    maxTouchPoints: 0,
    sendBeacon: () => true,
    javaEnabled: () => false,
    geolocation: {},
    mediaDevices: {
      getUserMedia: () => Promise.reject(new Error('Not implemented'))
    }
  };
  console.log('✅ Navigator polyfill applied');
}

// Location polyfill
if (typeof global !== 'undefined' && typeof location === 'undefined') {
  global.location = {
    href: 'https://example.com',
    hostname: 'example.com',
    protocol: 'https:',
    host: 'example.com',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'https://example.com',
    port: '',
    assign: (url) => {},
    reload: () => {},
    replace: (url) => {}
  };
  console.log('✅ Location polyfill applied');
}

// GlobalThis polyfill
if (typeof global !== 'undefined' && typeof globalThis === 'undefined') {
  global.globalThis = global;
  console.log('✅ GlobalThis polyfill applied');
}

// History polyfill
if (typeof global !== 'undefined' && typeof history === 'undefined') {
  global.history = {
    length: 1,
    scrollRestoration: 'auto',
    state: null,
    back: () => {},
    forward: () => {},
    go: () => {},
    pushState: () => {},
    replaceState: () => {}
  };
  console.log('✅ History polyfill applied');
}

// Performance polyfill
if (typeof global !== 'undefined' && typeof performance === 'undefined') {
  global.performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByType: () => [],
    getEntriesByName: () => [],
    clearMarks: () => {},
    clearMeasures: () => {}
  };
  console.log('✅ Performance polyfill applied');
}

// URL polyfill
if (typeof global !== 'undefined' && typeof URL === 'undefined') {
  global.URL = require('url').URL;
  console.log('✅ URL polyfill applied');
}

// URLSearchParams polyfill
if (typeof global !== 'undefined' && typeof URLSearchParams === 'undefined') {
  global.URLSearchParams = require('url').URLSearchParams;
  console.log('✅ URLSearchParams polyfill applied');
}

// Export a function to verify polyfills are working
module.exports = {
  verifyPolyfills: () => {
    const hasWindow = typeof window !== 'undefined';
    const hasSelf = typeof self !== 'undefined';
    const hasDocument = typeof document !== 'undefined';
    const hasNavigator = typeof navigator !== 'undefined';
    const hasGlobalThis = typeof globalThis !== 'undefined';
    const hasLocation = typeof location !== 'undefined';
    const hasHistory = typeof history !== 'undefined';
    const hasPerformance = typeof performance !== 'undefined';
    
    console.log('Polyfill status:', {
      self: hasSelf ? '✅' : '❌',
      window: hasWindow ? '✅' : '❌',
      document: hasDocument ? '✅' : '❌',
      navigator: hasNavigator ? '✅' : '❌',
      globalThis: hasGlobalThis ? '✅' : '❌',
      location: hasLocation ? '✅' : '❌',
      history: hasHistory ? '✅' : '❌',
      performance: hasPerformance ? '✅' : '❌'
    });
    
    return {
      hasWindow,
      hasSelf,
      hasDocument,
      hasNavigator,
      hasGlobalThis,
      hasLocation,
      hasHistory,
      hasPerformance,
      allDefined: hasWindow && hasSelf && hasDocument && hasNavigator && 
                  hasGlobalThis && hasLocation && hasHistory && hasPerformance
    };
  }
};
