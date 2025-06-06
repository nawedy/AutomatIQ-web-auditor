// webpack-self-fix.js
// This file provides a webpack plugin to fix the "self is not defined" error

class WebpackSelfFix {
  // Apply the plugin to the webpack compiler
  apply(compiler) {
    // Hook into the compilation process
    compiler.hooks.thisCompilation.tap('WebpackSelfFix', (compilation) => {
      // Hook into the optimization phase
      compilation.hooks.processAssets.tap(
        {
          name: 'WebpackSelfFix',
          stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_OPTIMIZE_COMPATIBILITY,
        },
        (assets) => {
          // Process each asset
          Object.keys(assets).forEach((filename) => {
            // Only process JavaScript files
            if (filename.endsWith('.js')) {
              // Get the original source
              const source = assets[filename].source();
              
              // Add the self polyfill at the beginning of the file
              const polyfill = `
// Fix for "self is not defined" error
(function() {
  if (typeof self === 'undefined' && typeof global !== 'undefined') {
    global.self = global;
  }
})();
`;
              
              // Create the new source with the polyfill
              const newSource = polyfill + source;
              
              // Update the asset
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

module.exports = WebpackSelfFix;
