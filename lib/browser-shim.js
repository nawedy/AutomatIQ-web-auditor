// lib/browser-shim.js
// Provides browser globals for Node.js environment

if (typeof global.self === 'undefined') {
  global.self = global;
}

if (typeof global.window === 'undefined') {
  global.window = global;
}

if (typeof global.document === 'undefined') {
  global.document = {
    createElement: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    documentElement: { style: {} },
    body: { appendChild: () => {}, removeChild: () => {} },
  };
}

if (typeof global.navigator === 'undefined') {
  global.navigator = {
    userAgent: 'node',
    platform: process.platform,
  };
}

// Export a dummy function to make this importable
export default function setupBrowserShim() {
  return true;
}
