// lib/webpack/entry-polyfill-plugin.js
// A webpack plugin that injects polyfills at the entry points of the application

/**
 * Purpose: This plugin injects browser global polyfills at the entry points
 * of the application to ensure they're available before any other code runs
 */
class EntryPolyfillPlugin {
  constructor(options = {}) {
    this.options = {
      verbose: options.verbose === true
    };
  }

  apply(compiler) {
    const { EntryPlugin } = compiler.webpack;
    const { RawSource } = compiler.webpack.sources;
    
    // Log function that only logs if verbose is enabled
    const log = (message) => {
      if (this.options.verbose) {
        console.log(`[EntryPolyfillPlugin] ${message}`);
      }
    };

    // The polyfill code to inject
    const polyfillCode = `
// AutomatIQ Entry Point Polyfills
// This code runs before any other code in the application

// Define critical browser globals for both client and server environments
(function defineGlobals() {
  // Determine the global object (window, global, or globalThis)
  const getGlobalObject = function() {
    if (typeof globalThis !== 'undefined') return globalThis;
    if (typeof window !== 'undefined') return window;
    if (typeof global !== 'undefined') return global;
    if (typeof self !== 'undefined') return self;
    throw new Error('Unable to locate global object');
  };

  try {
    const globalObject = getGlobalObject();
    
    // Define self if it doesn't exist
    if (typeof globalObject.self === 'undefined') {
      globalObject.self = globalObject;
      console.log('[AutomatIQ Polyfill] Defined self');
    }
    
    // Define window if it doesn't exist
    if (typeof globalObject.window === 'undefined') {
      globalObject.window = globalObject.self;
      console.log('[AutomatIQ Polyfill] Defined window');
    }
    
    // Define document if it doesn't exist (minimal implementation)
    if (typeof globalObject.document === 'undefined') {
      globalObject.document = {
        createElement: () => ({
          style: {},
          setAttribute: () => {},
          getAttribute: () => null,
          appendChild: () => {},
          removeChild: () => {},
        }),
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
        documentElement: { style: {} },
        body: { appendChild: () => {}, removeChild: () => {} },
      };
      console.log('[AutomatIQ Polyfill] Defined document');
    }
    
    // Define navigator if it doesn't exist
    if (typeof globalObject.navigator === 'undefined') {
      globalObject.navigator = {
        userAgent: 'AutomatIQ/1.0',
        language: 'en-US',
        platform: typeof process !== 'undefined' ? process.platform : 'unknown',
      };
      console.log('[AutomatIQ Polyfill] Defined navigator');
    }
    
    // Define globalThis if it doesn't exist
    if (typeof globalObject.globalThis === 'undefined') {
      globalObject.globalThis = globalObject;
      console.log('[AutomatIQ Polyfill] Defined globalThis');
    }
    
    // Define location if it doesn't exist
    if (typeof globalObject.location === 'undefined') {
      globalObject.location = {
        href: 'https://automatiq.local',
        origin: 'https://automatiq.local',
        protocol: 'https:',
        host: 'automatiq.local',
        hostname: 'automatiq.local',
        port: '',
        pathname: '/',
        search: '',
        hash: '',
      };
      console.log('[AutomatIQ Polyfill] Defined location');
    }
    
    console.log('[AutomatIQ Polyfill] All browser globals successfully defined');
  } catch (error) {
    console.error('[AutomatIQ Polyfill] Error defining globals:', error);
  }
})();
`;

    // Create a virtual module for our polyfill
    const POLYFILL_MODULE_NAME = 'automatiq-entry-polyfill';
    
    // Hook into the compilation process
    compiler.hooks.compilation.tap('EntryPolyfillPlugin', (compilation) => {
      log('Plugin activated for compilation');
      
      // Add the polyfill as a module
      compilation.hooks.additionalAssets.tap('EntryPolyfillPlugin', () => {
        compilation.emitAsset(
          `${POLYFILL_MODULE_NAME}.js`,
          new RawSource(polyfillCode)
        );
        log('Emitted polyfill asset');
      });
      
      // Hook into the entry point creation
      compiler.hooks.make.tapAsync('EntryPolyfillPlugin', (compilation, callback) => {
        const { entrypoints } = compilation;
        
        // Process each entry point
        entrypoints.forEach((entry, name) => {
          log(`Processing entry point: ${name}`);
          
          // Add our polyfill to the beginning of each entry point
          const polyfillRequest = `./${POLYFILL_MODULE_NAME}.js`;
          const context = compiler.context;
          
          // Use EntryPlugin to prepend our polyfill
          new EntryPlugin(
            context,
            polyfillRequest,
            {
              name,
              filename: `${POLYFILL_MODULE_NAME}-${name}.js`,
            }
          ).apply(compiler);
          
          log(`Added polyfill to entry point: ${name}`);
        });
        
        callback();
      });
    });
  }
}

module.exports = EntryPolyfillPlugin;
