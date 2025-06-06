// browser-globals.js
// Purpose: Simple and direct browser globals polyfill for Node.js environment

// Define critical browser globals in the Node.js environment
if (typeof global.self === 'undefined') {
  global.self = global;
  console.log('✅ Defined self');
}

if (typeof global.window === 'undefined') {
  global.window = global.self;
  console.log('✅ Defined window');
}

if (typeof global.document === 'undefined') {
  global.document = {
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
    getElementById: () => null,
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
  };
  console.log('✅ Defined document');
}

if (typeof global.navigator === 'undefined') {
  global.navigator = {
    userAgent: 'AutomatIQ/1.0 (Node.js)',
    language: 'en-US',
  };
  console.log('✅ Defined navigator');
}

if (typeof global.location === 'undefined') {
  global.location = {
    href: 'https://automatiq.local',
    origin: 'https://automatiq.local',
    protocol: 'https:',
    host: 'automatiq.local',
    hostname: 'automatiq.local',
    pathname: '/',
    search: '',
    hash: '',
  };
  console.log('✅ Defined location');
}

console.log('✅ Browser globals polyfill applied');

module.exports = {
  verify: () => {
    const globals = ['self', 'window', 'document', 'navigator', 'location'];
    const missing = globals.filter(name => typeof global[name] === 'undefined');
    
    if (missing.length > 0) {
      console.error(`❌ Missing globals: ${missing.join(', ')}`);
      return false;
    }
    
    console.log('✅ All browser globals verified');
    return true;
  }
};
