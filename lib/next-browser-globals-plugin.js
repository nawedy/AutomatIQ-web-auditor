// lib/next-browser-globals-plugin.js
// A Next.js plugin that ensures browser globals are available in all environments

/**
 * Purpose: This plugin ensures browser globals are available in all environments
 * by injecting polyfills at the beginning of all JavaScript files
 */
class NextBrowserGlobalsPlugin {
  constructor(options = {}) {
    this.options = {
      debug: options.debug === true
    };
  }

  // Log function that only logs if debug is enabled
  log(message) {
    if (this.options.debug) {
      console.log(`[NextBrowserGlobalsPlugin] ${message}`);
    }
  }

  // Apply the plugin to the webpack compiler
  apply(compiler) {
    const { Compilation } = compiler.webpack;
    const { RawSource } = compiler.webpack.sources;

    // The polyfill code to inject at the beginning of each file
    const polyfillCode = `
// AutomatIQ Browser Globals Polyfill
(function() {
  if (typeof globalThis !== 'undefined') {
    if (typeof globalThis.self === 'undefined') {
      globalThis.self = globalThis;
    }
    if (typeof globalThis.window === 'undefined') {
      globalThis.window = globalThis.self;
    }
  } else if (typeof global !== 'undefined') {
    if (typeof global.self === 'undefined') {
      global.self = global;
    }
    if (typeof global.window === 'undefined') {
      global.window = global.self;
    }
    if (typeof global.globalThis === 'undefined') {
      global.globalThis = global;
    }
  }
})();
`;

    // Hook into the compilation process
    compiler.hooks.compilation.tap('NextBrowserGlobalsPlugin', (compilation) => {
      this.log('Plugin activated for compilation');

      // Hook into the process assets phase
      compilation.hooks.processAssets.tap(
        {
          name: 'NextBrowserGlobalsPlugin',
          stage: Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        (assets) => {
          this.log(`Processing ${Object.keys(assets).length} assets`);

          // Process each asset
          Object.keys(assets).forEach(filename => {
            // Only process JavaScript files
            if (filename.endsWith('.js')) {
              const source = assets[filename].source();
              
              // Skip if the polyfill is already included
              if (source.includes('AutomatIQ Browser Globals Polyfill')) {
                this.log(`Skipping ${filename} - polyfill already present`);
                return;
              }
              
              this.log(`Injecting polyfills into ${filename}`);
              
              // Create the new source with the polyfill prepended
              const newSource = polyfillCode + source;
              
              // Update the asset with the modified source
              compilation.updateAsset(
                filename,
                new RawSource(newSource)
              );
            }
          });
          
          this.log('Asset processing complete');
        }
      );
    });
  }
}

module.exports = NextBrowserGlobalsPlugin;
