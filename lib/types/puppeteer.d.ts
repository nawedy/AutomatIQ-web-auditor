// lib/types/puppeteer.d.ts
// Type declarations for puppeteer

declare namespace puppeteer {
  interface Browser {
    newPage(): Promise<Page>;
    close(): Promise<void>;
    pages(): Promise<Page[]>;
    version(): Promise<string>;
    userAgent(): Promise<string>;
  }

  interface Page {
    goto(url: string, options?: { waitUntil?: string | string[]; timeout?: number }): Promise<any>;
    setViewport(viewport: { width: number; height: number }): Promise<void>;
    screenshot(options?: { path?: string; fullPage?: boolean; encoding?: string }): Promise<Buffer | string>;
    evaluate<T>(fn: (...args: any[]) => T, ...args: any[]): Promise<T>;
    evaluateHandle(fn: (...args: any[]) => any, ...args: any[]): Promise<any>;
    $eval(selector: string, fn: (element: Element, ...args: any[]) => any, ...args: any[]): Promise<any>;
    $$eval(selector: string, fn: (elements: Element[], ...args: any[]) => any, ...args: any[]): Promise<any>;
    $(selector: string): Promise<ElementHandle | null>;
    $$(selector: string): Promise<ElementHandle[]>;
    waitForSelector(selector: string, options?: { visible?: boolean; hidden?: boolean; timeout?: number }): Promise<ElementHandle | null>;
    waitForNavigation(options?: { waitUntil?: string | string[]; timeout?: number }): Promise<any>;
    waitForFunction(fn: (...args: any[]) => any, options?: { polling?: string | number; timeout?: number }, ...args: any[]): Promise<any>;
    setUserAgent(userAgent: string): Promise<void>;
    setJavaScriptEnabled(enabled: boolean): Promise<void>;
    emulateMediaType(type: string): Promise<void>;
    emulate(options: { viewport: { width: number; height: number }; userAgent: string }): Promise<void>;
    close(): Promise<void>;
    content(): Promise<string>;
    title(): Promise<string>;
    url(): Promise<string>;
    on(event: string, callback: (...args: any[]) => void): void;
    off(event: string, callback: (...args: any[]) => void): void;
  }

  interface ElementHandle {
    $(selector: string): Promise<ElementHandle | null>;
    $$(selector: string): Promise<ElementHandle[]>;
    $eval(selector: string, fn: (element: Element, ...args: any[]) => any, ...args: any[]): Promise<any>;
    $$eval(selector: string, fn: (elements: Element[], ...args: any[]) => any, ...args: any[]): Promise<any>;
    boundingBox(): Promise<{ x: number; y: number; width: number; height: number } | null>;
    click(options?: { button?: string; clickCount?: number; delay?: number }): Promise<void>;
    focus(): Promise<void>;
    hover(): Promise<void>;
    press(key: string, options?: { text?: string; delay?: number }): Promise<void>;
    screenshot(options?: { path?: string; encoding?: string }): Promise<Buffer | string>;
    tap(): Promise<void>;
    type(text: string, options?: { delay?: number }): Promise<void>;
    uploadFile(...filePaths: string[]): Promise<void>;
    evaluate<T>(fn: (element: Element, ...args: any[]) => T, ...args: any[]): Promise<T>;
    evaluateHandle(fn: (element: Element, ...args: any[]) => any, ...args: any[]): Promise<any>;
    getProperty(propertyName: string): Promise<any>;
    dispose(): Promise<void>;
  }

  interface LaunchOptions {
    headless?: boolean | 'new';
    executablePath?: string;
    slowMo?: number;
    defaultViewport?: { width: number; height: number } | null;
    args?: string[];
    ignoreHTTPSErrors?: boolean;
    userDataDir?: string;
    timeout?: number;
    dumpio?: boolean;
    pipe?: boolean;
    product?: string;
    devtools?: boolean;
  }

  function launch(options?: LaunchOptions): Promise<Browser>;
  function connect(options: { browserWSEndpoint?: string; browserURL?: string }): Promise<Browser>;
}

declare module 'puppeteer' {
  export = puppeteer;
}
