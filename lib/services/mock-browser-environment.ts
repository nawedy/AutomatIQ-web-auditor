// lib/services/mock-browser-environment.ts
// Mock browser environment for server-side rendering

// Define a custom window type that's compatible with both Window and globalThis
type SafeWindow = Omit<Window, 'self' | 'window' | 'globalThis' | 'performance' | 'location' | 'navigator'> & {
  self: any;
  window: any;
  performance: any;
  location: any;
  navigator: any;
  [key: number]: Window;
  [key: string]: any;
};

// Create a minimal implementation of Window interface for server-side rendering
class MockWindow implements Partial<SafeWindow> {
  // Add index signatures to satisfy the interface
  [key: number]: Window;
  [key: string]: any;
  // Basic window properties
  readonly innerHeight: number = 1080;
  readonly innerWidth: number = 1920;
  readonly outerHeight: number = 1080;
  readonly outerWidth: number = 1920;
  readonly pageXOffset: number = 0;
  readonly pageYOffset: number = 0;
  readonly screenX: number = 0;
  readonly screenY: number = 0;
  readonly screenLeft: number = 0;
  readonly screenTop: number = 0;
  readonly scrollX: number = 0;
  readonly scrollY: number = 0;
  readonly name: string = '';
  readonly status: string = '';
  readonly closed: boolean = false;
  readonly length: number = 0;
  readonly opener: Window | null = null;
  readonly parent: Window = this as any;
  readonly self: any = this;
  readonly top: any = this;
  readonly window: any = this;
  readonly frames: any = this;
  readonly localStorage = {
    getItem: (_key: string) => null,
    setItem: (_key: string, _value: string) => {},
    removeItem: (_key: string) => {},
    clear: () => {},
    key: (_index: number) => null,
    length: 0
  };
  readonly sessionStorage = this.localStorage;
  readonly performance = {
    now: () => Date.now(),
    mark: () => {},
    measure: () => {},
    getEntriesByName: () => [],
    getEntriesByType: () => [],
    getEntries: () => [],
    clearMarks: () => {},
    clearMeasures: () => {},
    timeOrigin: Date.now(),
    timing: {
      navigationStart: Date.now(),
      loadEventEnd: Date.now() + 1000
    },
    // Add missing required properties
    navigation: {
      type: 0,
      redirectCount: 0
    },
    onresourcetimingbufferfull: null,
    clearResourceTimings: () => {},
    setResourceTimingBufferSize: () => {},
    toJSON: () => ({})
  } as any;
  
  // Custom property for collecting JS errors in tests
  JSErrors: Array<{message: string; line: number; source: string}> = [];

  // Location
  location = {
    href: 'https://example.com',
    hostname: 'example.com',
    protocol: 'https:',
    host: 'example.com',
    pathname: '/',
    search: '',
    hash: '',
    origin: 'https://example.com',
    port: '',
    assign: (_url: string) => {},
    reload: () => {},
    replace: (_url: string) => {},
    toString: () => 'https://example.com',
    // Add missing required properties
    ancestorOrigins: {
      length: 0,
      item: () => null,
      contains: () => false
    }
  } as any;
  
  // Navigator - use a minimal implementation that satisfies the most commonly used properties
  navigator = {
    userAgent: 'MockBrowser/1.0',
    language: 'en-US',
    languages: ['en-US', 'en'],
    platform: 'MockOS',
    onLine: true,
    cookieEnabled: true,
    doNotTrack: null,
    hardwareConcurrency: 8,
    maxTouchPoints: 0,
    vendor: 'Mock',
    appName: 'MockBrowser',
    appVersion: '1.0',
    product: 'MockGecko',
    productSub: '20030107',
    userAgentData: undefined,
    // Add minimal implementations of required Navigator methods
    sendBeacon: () => true,
    javaEnabled: () => false,
    vibrate: () => false,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  } as any;

  // Document
  document = {
    createElement: () => ({
      style: {},
      setAttribute: () => {},
      getAttribute: () => null,
      appendChild: () => {},
      removeChild: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      getBoundingClientRect: () => ({ top: 0, left: 0, bottom: 0, right: 0, width: 0, height: 0 })
    }),
    createTextNode: () => ({}),
    querySelector: () => null,
    querySelectorAll: () => [],
    getElementById: () => null,
    getElementsByClassName: () => [],
    getElementsByTagName: () => [],
    documentElement: { style: {}, clientWidth: 1920, clientHeight: 1080 },
    head: { appendChild: () => {} },
    body: { appendChild: () => {} },
    location: this.location,
    title: 'Mock Document',
    referrer: '',
    cookie: '',
    readyState: 'complete',
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true
  } as unknown as Document;

  // Methods
  alert(): void {}
  confirm(): boolean { return true; }
  prompt(): string | null { return null; }
  close(): void {}
  focus(): void {}
  blur(): void {}
  open(): Window | null { return null; }
  setTimeout(handler: TimerHandler): number { return 0; }
  clearTimeout(_id?: number): void {}
  setInterval(handler: TimerHandler): number { return 0; }
  clearInterval(_id?: number): void {}
  requestAnimationFrame(_callback: FrameRequestCallback): number { return 0; }
  cancelAnimationFrame(_handle: number): void {}
  getComputedStyle(): CSSStyleDeclaration { return {} as CSSStyleDeclaration; }
  matchMedia(_query: string): MediaQueryList { return { matches: false, media: '', onchange: null } as unknown as MediaQueryList; }
  fetch(): Promise<Response> { return Promise.reject(new Error('Not implemented')); }
  btoa(data: string): string { return Buffer.from(data).toString('base64'); }
  atob(data: string): string { return Buffer.from(data, 'base64').toString(); }
  addEventListener(): void {}
  removeEventListener(): void {}
  dispatchEvent(): boolean { return true; }
  scrollTo(): void {}
  scrollBy(): void {}
  getSelection(): Selection | null { return null; }
}

// Export mock objects
export const mockWindow = new MockWindow();
export const mockDocument = mockWindow.document;
export const mockNavigator = mockWindow.navigator;
export const mockSelf = mockWindow.self;

// Set global objects if in server environment
if (typeof window === 'undefined' && typeof global !== 'undefined') {
  // Use type assertions to avoid TypeScript errors while maintaining runtime functionality
  (global as any).window = mockWindow;
  (global as any).document = mockDocument;
  (global as any).navigator = mockNavigator;
  (global as any).self = mockWindow; // Ensure self is the same as window
  
  // Define self at the top level for modules that reference it directly
  global.self = global.window;
  
  // Add globalThis reference for modern code
  (global as any).globalThis = mockWindow;
};

// Export a function to apply these mocks to the global scope
export function applyMocks() {
  if (typeof window === 'undefined' && typeof global !== 'undefined') {
    // Set window first as other objects may reference it
    if (typeof (global as any).window === 'undefined') {
      (global as any).window = mockWindow;
    }
    
    // Set self to be the same as window
    if (typeof (global as any).self === 'undefined') {
      (global as any).self = (global as any).window;
    }
    
    // Define self at the top level for modules that reference it directly
    if (typeof global.self === 'undefined') {
      global.self = global.window;
    }
    
    // Add globalThis reference for modern code
    if (typeof (global as any).globalThis === 'undefined') {
      (global as any).globalThis = (global as any).window;
    }
    
    // Set document
    if (typeof (global as any).document === 'undefined') {
      (global as any).document = mockDocument;
    }
    
    // Set navigator
    if (typeof (global as any).navigator === 'undefined') {
      (global as any).navigator = mockNavigator;
    }
  }
}

// Apply mocks automatically when imported
applyMocks();
