// lib/webpack/browser-modules-plugin.js
// Custom webpack plugin to handle browser-specific modules during server-side rendering

/**
 * A webpack plugin that replaces browser-specific modules with empty modules during server-side rendering
 */
class BrowserModulesPlugin {
  constructor(options = {}) {
    this.options = {
      modules: [
        'puppeteer',
        'resemblejs',
        'lighthouse',
        '@axe-core/puppeteer',
        ...(options.modules || [])
      ],
      isServer: options.isServer || false
    };
  }

  apply(compiler) {
    // Only apply this plugin during server-side compilation
    if (!this.options.isServer) {
      return;
    }

    // Get the modules to replace
    const modulesToReplace = this.options.modules;
    const emptyModulePath = require.resolve('./empty-module.js');

    // Hook into the normal module factory
    compiler.hooks.normalModuleFactory.tap('BrowserModulesPlugin', (factory) => {
      // Hook into the resolve step - in webpack 5 this is a bailing hook, not a waterfall hook
      factory.hooks.beforeResolve.tap('BrowserModulesPlugin', (resolveData) => {
        if (!resolveData) return;
        
        // Check if the request matches any of our browser-specific modules
        const shouldReplace = modulesToReplace.some(module => {
          return resolveData.request === module || resolveData.request.startsWith(`${module}/`);
        });
        
        // If it's a browser-specific module, replace it with an empty module
        if (shouldReplace) {
          // Modify the request in place (don't return the object)
          resolveData.request = emptyModulePath;
        }
        
        // Don't return anything - just modify the object in place
      });
    });
  }
}

module.exports = BrowserModulesPlugin;
