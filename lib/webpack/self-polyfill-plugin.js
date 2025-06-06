// lib/webpack/self-polyfill-plugin.js
// A webpack plugin that injects a self polyfill at the beginning of bundles

class SelfPolyfillPlugin {
  constructor(options = {}) {
    this.options = {
      test: options.test || /\.js$/,
      isServer: options.isServer || false
    };
  }

  apply(compiler) {
    // Only apply this plugin during server-side compilation
    if (!this.options.isServer) {
      return;
    }

    // The polyfill code to inject
    const polyfillCode = `
      // Self polyfill for server-side rendering
      if (typeof self === 'undefined' && typeof global !== 'undefined') {
        global.self = global;
      }
    `;

    // Hook into the compilation process
    compiler.hooks.compilation.tap('SelfPolyfillPlugin', (compilation) => {
      // Hook into the process assets phase
      compilation.hooks.processAssets.tap(
        {
          name: 'SelfPolyfillPlugin',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONS
        },
        (assets) => {
          // Loop through all assets
          Object.keys(assets).forEach(filename => {
            // Only process JS files
            if (this.options.test.test(filename)) {
              // Get the original source
              const source = assets[filename].source();
              
              // Prepend our polyfill
              const modifiedSource = `${polyfillCode}\n${source}`;
              
              // Update the asset
              compilation.updateAsset(
                filename,
                new compiler.webpack.sources.RawSource(modifiedSource)
              );
            }
          });
        }
      );
    });
  }
}

module.exports = SelfPolyfillPlugin;
