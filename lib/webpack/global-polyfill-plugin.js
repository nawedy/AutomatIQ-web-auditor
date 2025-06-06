// lib/webpack/global-polyfill-plugin.js
// A webpack plugin that injects global polyfills at the beginning of all chunks

/**
 * Purpose: This plugin injects global polyfills at the beginning of all chunks
 * to ensure browser globals are available in any environment
 */
class GlobalPolyfillPlugin {
  constructor(options = {}) {
    this.options = {
      isServer: options.isServer === true,
      test: options.test || /\.js$/,
      includePolyfills: options.includePolyfills !== false
    };
  }

  apply(compiler) {
    // Only apply to server-side bundles unless specified otherwise
    if (!this.options.isServer && !this.options.includePolyfills) {
      return;
    }

    // The polyfill code to inject at the beginning of each chunk
    const polyfillCode = `
// AutomatIQ Global Polyfills - injected by webpack plugin
(function() {
  // Self polyfill - must be first as other globals may reference it
  if (typeof self === 'undefined' && typeof global !== 'undefined') {
    global.self = global;
  }

  // Window polyfill
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    global.window = global.self;
  }

  // Document polyfill with minimal implementation
  if (typeof document === 'undefined' && typeof global !== 'undefined') {
    global.document = {
      createElement: () => ({}),
      addEventListener: () => {},
      removeEventListener: () => {},
      querySelector: () => null,
      querySelectorAll: () => []
    };
  }

  // Navigator polyfill
  if (typeof navigator === 'undefined' && typeof global !== 'undefined') {
    global.navigator = {
      userAgent: 'AutomatIQ/1.0',
      language: 'en-US'
    };
  }

  // GlobalThis polyfill
  if (typeof globalThis === 'undefined' && typeof global !== 'undefined') {
    global.globalThis = global;
  }
})();
`;

    // Hook into the compilation process
    compiler.hooks.compilation.tap('GlobalPolyfillPlugin', (compilation) => {
      // Use the appropriate hook based on webpack version
      const { Compilation } = compiler.webpack;
      
      // Hook into the process assets phase
      compilation.hooks.processAssets.tap(
        {
          name: 'GlobalPolyfillPlugin',
          // Use an early stage to ensure our polyfills are added before other transformations
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        (assets) => {
          // Process each asset
          Object.keys(assets).forEach(filename => {
            // Only process JS files that match our test pattern
            if (this.options.test.test(filename)) {
              const source = assets[filename].source();
              
              // Skip if the polyfill is already included
              if (source.includes('AutomatIQ Global Polyfills')) {
                return;
              }
              
              // Create the new source with the polyfill prepended
              const newSource = polyfillCode + source;
              
              // Update the asset with the modified source
              compilation.updateAsset(
                filename,
                new compiler.webpack.sources.RawSource(newSource)
              );
            }
          });
        }
      );
    });
  }
}

module.exports = GlobalPolyfillPlugin;
