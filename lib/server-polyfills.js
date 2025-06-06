// lib/server-polyfills.js
// This file provides polyfills for browser globals in Node.js environment

// Only run this code in a Node.js environment
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Create minimal implementations of browser globals
  const mockWindow = {
    self: {},
    document: {
      createElement: () => ({
        style: {},
        setAttribute: () => {},
        getAttribute: () => null,
        appendChild: () => {},
      }),
      querySelector: () => null,
      querySelectorAll: () => [],
      getElementById: () => null,
    },
    navigator: {
      userAgent: 'MockBrowser/1.0',
      language: 'en-US',
    },
    location: {
      href: 'https://example.com',
      hostname: 'example.com',
      protocol: 'https:',
    },
  };

  // Make window self-referential
  mockWindow.self = mockWindow;
  mockWindow.window = mockWindow;
  mockWindow.globalThis = mockWindow;

  // Set globals
  global.window = mockWindow;
  global.self = mockWindow;
  global.document = mockWindow.document;
  global.navigator = mockWindow.navigator;
  global.location = mockWindow.location;
  global.globalThis = mockWindow;

  console.log('✅ Server polyfills for browser globals have been applied');
}
