// lib/browser-shim.cjs
// Provides comprehensive browser globals for Node.js environment

// Define self first as it's often referenced by other globals
if (typeof global.self === 'undefined') {
  global.self = global;
}

// Define window with common properties and methods
if (typeof global.window === 'undefined') {
  global.window = global;
  
  // Add common window properties
  global.innerHeight = 1080;
  global.innerWidth = 1920;
  global.outerHeight = 1080;
  global.outerWidth = 1920;
  global.pageXOffset = 0;
  global.pageYOffset = 0;
  global.screenX = 0;
  global.screenY = 0;
  global.scrollX = 0;
  global.scrollY = 0;
  
  // Add common window methods
  global.setTimeout = global.setTimeout || setTimeout;
  global.clearTimeout = global.clearTimeout || clearTimeout;
  global.setInterval = global.setInterval || setInterval;
  global.clearInterval = global.clearInterval || clearInterval;
  global.requestAnimationFrame = function(callback) { setTimeout(callback, 0); return 0; };
  global.cancelAnimationFrame = function() {};
  
  // Add localStorage and sessionStorage mock
  const storageMock = {
    getItem: (key) => null,
    setItem: (key, value) => {},
    removeItem: (key) => {},
    clear: () => {},
    key: (index) => null,
    length: 0
  };
  
  global.localStorage = storageMock;
  global.sessionStorage = storageMock;
}

// Define document with common properties and methods
if (typeof global.document === 'undefined') {
  global.document = {
    createElement: (tag) => ({
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 }),
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
    documentElement: { style: {}, clientWidth: 1920, clientHeight: 1080 },
    head: { appendChild: () => {} },
    body: { appendChild: () => {}, removeChild: () => {} },
    location: { href: 'https://example.com' },
    cookie: '',
    readyState: 'complete'
  };
}

// Define navigator with common properties
if (typeof global.navigator === 'undefined') {
  global.navigator = {
    userAgent: 'Mozilla/5.0 (Node.js) AutomatIQ/1.0',
    language: 'en-US',
    languages: ['en-US', 'en'],
    platform: process.platform,
    vendor: 'Node.js',
    onLine: true,
    cookieEnabled: true,
    hardwareConcurrency: 4,
    maxTouchPoints: 0,
    sendBeacon: () => true,
    javaEnabled: () => false
  };
}

// Define location if not already defined
if (typeof global.location === 'undefined') {
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
}

// Define globalThis for modern code
if (typeof global.globalThis === 'undefined') {
  global.globalThis = global;
}

// Export for CommonJS
module.exports = {
  setupBrowserShim: function() {
    console.log('✅ Browser globals have been successfully shimmed in Node.js environment');
    return true;
  }
};
