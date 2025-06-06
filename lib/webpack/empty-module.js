// lib/webpack/empty-module.js
// Enhanced empty module to replace browser-specific modules during server-side rendering

// Create a proxy handler that returns mock values for any property access
const proxyHandler = {
  get: function(target, prop) {
    // Handle special cases
    if (prop === 'then') {
      // Make the object thenable to handle Promise expectations
      return undefined;
    }
    
    if (prop === 'default') {
      // Handle ES module default exports
      return new Proxy({}, proxyHandler);
    }
    
    if (typeof prop === 'symbol') {
      // Handle Symbol access
      return undefined;
    }
    
    // For functions, return a function that returns a proxied empty object
    if (!target[prop]) {
      target[prop] = function(...args) {
        // If the function name suggests it returns a Promise
        if (['launch', 'connect', 'compareImages', 'analyze', 'evaluate', 'fetch'].includes(prop)) {
          return Promise.resolve(new Proxy({}, proxyHandler));
        }
        // Return a proxied empty object for regular functions
        return new Proxy({}, proxyHandler);
      };
    }
    
    return target[prop];
  },
  apply: function(target, thisArg, args) {
    // Make the object callable
    return new Proxy({}, proxyHandler);
  }
};

// Create a base object with common methods
const baseModule = {
  // Common browser module methods
  launch: () => Promise.resolve(new Proxy({}, proxyHandler)),
  connect: () => Promise.resolve(new Proxy({}, proxyHandler)),
  compareImages: () => Promise.resolve(new Proxy({ data: {} }, proxyHandler)),
  analyze: () => Promise.resolve(new Proxy({ score: 100 }, proxyHandler)),
  default: new Proxy({}, proxyHandler),
  
  // Constructor and factory methods
  create: () => new Proxy({}, proxyHandler),
  constructor: function() { return new Proxy({}, proxyHandler); }
};

// Export a proxied version of the base module
module.exports = new Proxy(baseModule, proxyHandler);

// Also export as default for ES modules
module.exports.default = module.exports;
