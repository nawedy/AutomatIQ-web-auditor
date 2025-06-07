/**
 * This file defines modules that should only be imported on the server side
 * to avoid bundling them in client-side code.
 */

// Server-only modules that should be dynamically imported
export const SERVER_ONLY_MODULES = [
  'lighthouse',
  'puppeteer',
  'chrome-launcher',
  // Add other server-only modules here
];
