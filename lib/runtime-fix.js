// lib/runtime-fix.js
// Runtime fix for "self is not defined" error in Next.js server bundle

// Immediately execute this fix
(function() {
  // Check if we're in a Node.js environment
  const isNode = typeof process !== 'undefined' && 
                process.versions != null && 
                process.versions.node != null;
  
  if (isNode) {
    // Fix for "self is not defined" error
    if (typeof global.self === 'undefined') {
      global.self = global;
      console.log('[AutomatIQ] Runtime fix: self defined as global');
    }
    
    // Fix for "window is not defined" error
    if (typeof global.window === 'undefined') {
      global.window = global.self;
      console.log('[AutomatIQ] Runtime fix: window defined as self');
    }
    
    // Fix for "document is not defined" error
    if (typeof global.document === 'undefined') {
      global.document = {
        createElement: () => ({}),
        addEventListener: () => {},
        removeEventListener: () => {},
        querySelector: () => null,
        querySelectorAll: () => [],
      };
      console.log('[AutomatIQ] Runtime fix: document defined with minimal implementation');
    }
    
    // Fix for "navigator is not defined" error
    if (typeof global.navigator === 'undefined') {
      global.navigator = {
        userAgent: 'AutomatIQ/1.0',
        language: 'en-US',
      };
      console.log('[AutomatIQ] Runtime fix: navigator defined with minimal implementation');
    }
    
    // Fix for "globalThis is not defined" error
    if (typeof global.globalThis === 'undefined') {
      global.globalThis = global;
      console.log('[AutomatIQ] Runtime fix: globalThis defined as global');
    }
  }
})();

// Export a function to verify the fix is working
module.exports = {
  verifyFix: function() {
    const hasSelf = typeof self !== 'undefined';
    const hasWindow = typeof window !== 'undefined';
    const hasDocument = typeof document !== 'undefined';
    const hasNavigator = typeof navigator !== 'undefined';
    const hasGlobalThis = typeof globalThis !== 'undefined';
    
    console.log('[AutomatIQ] Runtime fix verification:', {
      self: hasSelf ? '✅' : '❌',
      window: hasWindow ? '✅' : '❌',
      document: hasDocument ? '✅' : '❌',
      navigator: hasNavigator ? '✅' : '❌',
      globalThis: hasGlobalThis ? '✅' : '❌',
    });
    
    return {
      hasSelf,
      hasWindow,
      hasDocument,
      hasNavigator,
      hasGlobalThis,
      allDefined: hasSelf && hasWindow && hasDocument && hasNavigator && hasGlobalThis
    };
  }
};
