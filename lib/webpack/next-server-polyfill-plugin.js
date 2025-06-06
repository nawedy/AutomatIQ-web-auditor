// lib/webpack/next-server-polyfill-plugin.js
// A webpack plugin specifically designed to fix the "self is not defined" error in Next.js server bundles

/**
 * Purpose: This plugin injects polyfills at the beginning of Next.js server bundles
 * to ensure browser globals are available in the Node.js environment
 */
class NextServerPolyfillPlugin {
  constructor(options = {}) {
    this.options = {
      isServer: options.isServer === true,
      verbose: options.verbose === true
    };
  }

  apply(compiler) {
    // Only apply to server-side bundles
    if (!this.options.isServer) {
      return;
    }

    const { Compilation } = compiler.webpack;
    const { sources } = compiler.webpack;

    // The polyfill code to inject at the beginning of each chunk
    const polyfillCode = `
// AutomatIQ Next.js Server Polyfills - injected by webpack plugin
(function() {
  if (typeof self === 'undefined' && typeof global !== 'undefined') {
    global.self = global;
  }
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    global.window = global.self;
  }
  if (typeof document === 'undefined' && typeof global !== 'undefined') {
    global.document = {
      createElement: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }
  if (typeof navigator === 'undefined' && typeof global !== 'undefined') {
    global.navigator = {
      userAgent: 'AutomatIQ/1.0',
      language: 'en-US',
      platform: process.platform
    };
  }
  if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
    global.globalThis = global;
  }
})();
`;

    // Log function that only logs if verbose is enabled
    const log = (message) => {
      if (this.options.verbose) {
        console.log(`[NextServerPolyfillPlugin] ${message}`);
      }
    };

    // Hook into the compilation process
    compiler.hooks.compilation.tap('NextServerPolyfillPlugin', (compilation) => {
      log('Plugin activated for server-side compilation');

      // Hook into the process assets phase
      compilation.hooks.processAssets.tap(
        {
          name: 'NextServerPolyfillPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        (assets) => {
          log(`Processing ${Object.keys(assets).length} assets`);

          // Process each asset
          Object.keys(assets).forEach(filename => {
            // Only process JS files in the server bundle
            if (filename.endsWith('.js') && 
                (filename.includes('server/') || 
                 filename.includes('pages/') || 
                 filename.includes('app/'))) {
              
              const source = assets[filename].source();
              
              // Skip if the polyfill is already included
              if (source.includes('AutomatIQ Next.js Server Polyfills')) {
                log(`Skipping ${filename} - polyfill already present`);
                return;
              }
              
              log(`Injecting polyfills into ${filename}`);
              
              // Create the new source with the polyfill prepended
              const newSource = polyfillCode + source;
              
              // Update the asset with the modified source
              compilation.updateAsset(
                filename,
                new sources.RawSource(newSource)
              );
            }
          });
          
          log('Asset processing complete');
        }
      );
    });
  }
}

module.exports = NextServerPolyfillPlugin;
