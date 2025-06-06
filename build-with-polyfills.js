#!/usr/bin/env node
// build-with-polyfills.js
// Custom build script that applies polyfills before running Next.js build

// Apply critical polyfills immediately
if (typeof self === 'undefined' && typeof global !== 'undefined') {
  global.self = global;
  console.log('\u2705 Self polyfill applied in build script');
}

if (typeof window === 'undefined' && typeof global !== 'undefined') {
  global.window = global.self;
  console.log('\u2705 Window polyfill applied in build script');
}

if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
  global.globalThis = global;
  console.log('\u2705 GlobalThis polyfill applied in build script');
}

// Apply document polyfill
if (typeof document === 'undefined' && typeof global !== 'undefined') {
  global.document = {
    createElement: () => ({}),
    addEventListener: () => {},
    removeEventListener: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    documentElement: { style: {} },
    body: { appendChild: () => {}, removeChild: () => {} },
  };
  console.log('\u2705 Document polyfill applied in build script');
}

// Apply navigator polyfill
if (typeof navigator === 'undefined' && typeof global !== 'undefined') {
  global.navigator = {
    userAgent: 'AutomatIQ/1.0',
    language: 'en-US',
    platform: process.platform,
  };
  console.log('\u2705 Navigator polyfill applied in build script');
}

// Verify polyfills are working
const verifyPolyfills = () => {
  const hasSelf = typeof self !== 'undefined';
  const hasWindow = typeof window !== 'undefined';
  const hasDocument = typeof document !== 'undefined';
  const hasNavigator = typeof navigator !== 'undefined';
  const hasGlobalThis = typeof globalThis !== 'undefined';
  
  console.log('\nPolyfill verification:');
  console.log(`- self: ${hasSelf ? '\u2705' : '\u274C'}`);
  console.log(`- window: ${hasWindow ? '\u2705' : '\u274C'}`);
  console.log(`- document: ${hasDocument ? '\u2705' : '\u274C'}`);
  console.log(`- navigator: ${hasNavigator ? '\u2705' : '\u274C'}`);
  console.log(`- globalThis: ${hasGlobalThis ? '\u2705' : '\u274C'}`);
  
  return hasSelf && hasWindow && hasDocument && hasNavigator && hasGlobalThis;
};

// Verify polyfills
const polyfillsApplied = verifyPolyfills();
if (!polyfillsApplied) {
  console.error('\n\u274C Failed to apply all polyfills. Build may fail.');
} else {
  console.log('\n\u2705 All polyfills successfully applied.');
}

// Run Next.js build
console.log('\nStarting Next.js build with polyfills...\n');
const { spawnSync } = require('child_process');
const nextBuild = spawnSync('next', ['build'], { 
  stdio: 'inherit',
  env: {
    ...process.env,
    NODE_OPTIONS: '--require ./preload.js'
  }
});

// Check build result
if (nextBuild.status !== 0) {
  console.error(`\n\u274C Next.js build failed with exit code ${nextBuild.status}`);
  process.exit(nextBuild.status);
} else {
  console.log('\n\u2705 Next.js build completed successfully with polyfills.');
}
