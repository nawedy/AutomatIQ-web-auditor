// server.js
// Custom server implementation for Next.js with comprehensive browser polyfill for SSR

// Import our comprehensive browser polyfill at the very beginning
// This ensures all browser globals are defined before any other code runs
require('./lib/node-browser-polyfill.js');

// For backward compatibility, also import existing polyfills
require('./lib/browser-shim.cjs');
require('./lib/global-polyfills.js');
require('./lib/runtime-fix.js');

// Verify that all polyfills are properly applied
const { verifyPolyfills } = require('./lib/node-browser-polyfill.js');
const polyfillsApplied = verifyPolyfills();

// Additional fallback for critical globals if verification fails
if (!polyfillsApplied) {
  console.error('\n\x1b[31m❌ Failed to apply all polyfills. Applying emergency fallback...\x1b[0m');
  
  // Emergency fallback for critical globals
  if (typeof self === 'undefined') global.self = global;
  if (typeof window === 'undefined') global.window = global.self;
  if (typeof globalThis === 'undefined') global.globalThis = global;
  if (typeof document === 'undefined') global.document = { createElement: () => ({}), addEventListener: () => {} };
  if (typeof navigator === 'undefined') global.navigator = { userAgent: 'AutomatIQ/1.0' };
  
  console.log('\n\x1b[33m⚠️ Emergency fallback applied. Some features may not work correctly.\x1b[0m');
}

console.log('✅ Server-side browser globals verification complete');

// Import Next.js server
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
