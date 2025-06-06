// lib/node-browser-polyfill.js
// Purpose: Provides comprehensive browser globals polyfills for Node.js environment

/**
 * AutomatIQ Browser Globals Polyfill
 * 
 * This module defines browser globals in the Node.js environment to prevent
 * "self is not defined" and similar errors during server-side rendering.
 * It should be required at the very beginning of the application startup process.
 */

// Immediately execute the polyfill function
(function applyBrowserPolyfills() {
  try {
    // Define self if it doesn't exist
    if (typeof global.self === 'undefined') {
      global.self = global;
      console.log('\x1b[32m✓\x1b[0m Defined self');
    }

    // Define window if it doesn't exist
    if (typeof global.window === 'undefined') {
      global.window = global.self;
      console.log('\x1b[32m✓\x1b[0m Defined window');
    }

    // Define globalThis if it doesn't exist
    if (typeof global.globalThis === 'undefined') {
      global.globalThis = global;
      console.log('\x1b[32m✓\x1b[0m Defined globalThis');
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
        getElementById: () => null,
        getElementsByClassName: () => [],
        getElementsByTagName: () => [],
        documentElement: { style: {} },
        body: { 
          appendChild: () => {}, 
          removeChild: () => {},
          style: {}
        },
        head: {
          appendChild: () => {},
          removeChild: () => {}
        },
        createTextNode: () => ({}),
        location: {
          href: 'https://automatiq.local',
          origin: 'https://automatiq.local',
          protocol: 'https:',
          host: 'automatiq.local',
          hostname: 'automatiq.local',
          port: '',
          pathname: '/',
          search: '',
          hash: '',
        }
      };
      console.log('\x1b[32m✓\x1b[0m Defined document');
    }

    // Define navigator
    if (typeof global.navigator === 'undefined') {
      global.navigator = {
        userAgent: 'AutomatIQ/1.0 (Node.js)',
        language: 'en-US',
        languages: ['en-US', 'en'],
        platform: process.platform,
        vendor: 'AutomatIQ',
        appName: 'AutomatIQ',
        appVersion: '1.0.0',
        onLine: true,
        cookieEnabled: true,
      };
      console.log('\x1b[32m✓\x1b[0m Defined navigator');
    }

    // Define location
    if (typeof global.location === 'undefined') {
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
        assign: () => {},
        replace: () => {},
        reload: () => {},
      };
      console.log('\x1b[32m✓\x1b[0m Defined location');
    }

    // Define URL if it doesn't exist
    if (typeof global.URL === 'undefined') {
      global.URL = require('url').URL;
      console.log('\x1b[32m✓\x1b[0m Defined URL');
    }

    // Define URLSearchParams if it doesn't exist
    if (typeof global.URLSearchParams === 'undefined') {
      global.URLSearchParams = require('url').URLSearchParams;
      console.log('\x1b[32m✓\x1b[0m Defined URLSearchParams');
    }

    // Define performance if it doesn't exist
    if (typeof global.performance === 'undefined') {
      global.performance = {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {},
        getEntriesByName: () => [],
        getEntriesByType: () => [],
        getEntries: () => [],
        clearMarks: () => {},
        clearMeasures: () => {},
        timeOrigin: Date.now(),
        timing: {
          navigationStart: Date.now(),
        },
      };
      console.log('\x1b[32m✓\x1b[0m Defined performance');
    }

    // Define history if it doesn't exist
    if (typeof global.history === 'undefined') {
      global.history = {
        pushState: () => {},
        replaceState: () => {},
        go: () => {},
        back: () => {},
        forward: () => {},
        length: 1,
        state: null,
        scrollRestoration: 'auto',
      };
      console.log('\x1b[32m✓\x1b[0m Defined history');
    }

    // Define localStorage if it doesn't exist
    if (typeof global.localStorage === 'undefined') {
      const store = {};
      global.localStorage = {
        getItem: (key) => store[key] || null,
        setItem: (key, value) => { store[key] = String(value); },
        removeItem: (key) => { delete store[key]; },
        clear: () => { Object.keys(store).forEach(key => delete store[key]); },
        key: (index) => Object.keys(store)[index] || null,
        get length() { return Object.keys(store).length; },
      };
      console.log('\x1b[32m✓\x1b[0m Defined localStorage');
    }

    // Define sessionStorage if it doesn't exist
    if (typeof global.sessionStorage === 'undefined') {
      const sessionStore = {};
      global.sessionStorage = {
        getItem: (key) => sessionStore[key] || null,
        setItem: (key, value) => { sessionStore[key] = String(value); },
        removeItem: (key) => { delete sessionStore[key]; },
        clear: () => { Object.keys(sessionStore).forEach(key => delete sessionStore[key]); },
        key: (index) => Object.keys(sessionStore)[index] || null,
        get length() { return Object.keys(sessionStore).length; },
      };
      console.log('\x1b[32m✓\x1b[0m Defined sessionStorage');
    }

    // Define fetch if it doesn't exist
    if (typeof global.fetch === 'undefined') {
      global.fetch = () => Promise.resolve({
        json: () => Promise.resolve({}),
        text: () => Promise.resolve(''),
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(0)),
        blob: () => Promise.resolve({}),
        formData: () => Promise.resolve({}),
        ok: true,
        status: 200,
        statusText: 'OK',
        headers: new Map(),
      });
      console.log('\x1b[32m✓\x1b[0m Defined fetch');
    }

    // Define Image constructor if it doesn't exist
    if (typeof global.Image === 'undefined') {
      global.Image = class Image {
        constructor() {
          this.src = '';
          this.onload = null;
          this.onerror = null;
          this.width = 0;
          this.height = 0;
          this.complete = false;
          this.naturalWidth = 0;
          this.naturalHeight = 0;
        }
      };
      console.log('\x1b[32m✓\x1b[0m Defined Image');
    }

    // Define HTMLElement if it doesn't exist
    if (typeof global.HTMLElement === 'undefined') {
      global.HTMLElement = class HTMLElement {};
      console.log('\x1b[32m✓\x1b[0m Defined HTMLElement');
    }

    // Define Element if it doesn't exist
    if (typeof global.Element === 'undefined') {
      global.Element = class Element {};
      console.log('\x1b[32m✓\x1b[0m Defined Element');
    }

    // Define Event if it doesn't exist
    if (typeof global.Event === 'undefined') {
      global.Event = class Event {
        constructor(type, options = {}) {
          this.type = type;
          this.bubbles = options.bubbles || false;
          this.cancelable = options.cancelable || false;
          this.composed = options.composed || false;
        }
      };
      console.log('\x1b[32m✓\x1b[0m Defined Event');
    }

    // Define CustomEvent if it doesn't exist
    if (typeof global.CustomEvent === 'undefined') {
      global.CustomEvent = class CustomEvent extends global.Event {
        constructor(type, options = {}) {
          super(type, options);
          this.detail = options.detail || null;
        }
      };
      console.log('\x1b[32m✓\x1b[0m Defined CustomEvent');
    }

    console.log('\x1b[32m✓\x1b[0m All browser globals successfully defined in Node.js environment');
    return true;
  } catch (error) {
    console.error('\x1b[31m✗\x1b[0m Error applying browser polyfills:', error);
    return false;
  }
})();

// Export a function to verify the polyfills
module.exports = {
  verifyPolyfills: () => {
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
      fetch: typeof fetch !== 'undefined',
      Image: typeof Image !== 'undefined',
      HTMLElement: typeof HTMLElement !== 'undefined',
      Element: typeof Element !== 'undefined',
      Event: typeof Event !== 'undefined',
      CustomEvent: typeof CustomEvent !== 'undefined',
    };
    
    console.log('\nPolyfill verification:');
    Object.entries(checks).forEach(([name, exists]) => {
      console.log(`- ${name}: ${exists ? '\x1b[32m✓\x1b[0m' : '\x1b[31m✗\x1b[0m'}`);
    });
    
    const allDefined = Object.values(checks).every(Boolean);
    console.log(`\nAll polyfills ${allDefined ? '\x1b[32m✓ successfully applied\x1b[0m' : '\x1b[31m✗ failed to apply\x1b[0m'}\n`);
    
    return allDefined;
  }
};
