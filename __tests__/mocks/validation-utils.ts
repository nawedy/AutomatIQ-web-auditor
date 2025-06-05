// __tests__/mocks/validation-utils.ts
// Mock implementation of validation utilities for testing

export const isValidUUID = jest.fn((id: string) => {
  // Simple mock implementation that considers test-website-id as valid
  if (id === 'test-website-id') return true;
  
  // Basic UUID validation for test purposes
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
});

export const isValidURL = jest.fn((url: string) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
});

export const isValidWebhookURL = jest.fn((url: string | null | undefined) => {
  if (!url) return true;
  if (url.startsWith('https://')) return true;
  return false;
});

export const sanitizeString = jest.fn((str: string) => {
  if (!str) return '';
  return str.replace(/[<>]/g, '');
});

export const validateMonitoringConfig = jest.fn((data: any) => {
  // Basic validation for test purposes
  if (!data || typeof data !== 'object') {
    return { success: false, error: 'Invalid input data' };
  }
  
  const { websiteId, enabled, frequency } = data;
  
  if (!websiteId) {
    return { success: false, error: 'websiteId: Website ID is required' };
  }
  
  if (!isValidUUID(websiteId)) {
    return { success: false, error: 'websiteId: Invalid website ID format' };
  }
  
  if (typeof enabled !== 'boolean') {
    return { success: false, error: 'enabled: Must be a boolean' };
  }
  
  const validFrequencies = ['DAILY', 'WEEKLY', 'BIWEEKLY', 'MONTHLY', 'QUARTERLY'];
  if (!validFrequencies.includes(frequency)) {
    return { success: false, error: 'frequency: Invalid monitoring frequency' };
  }
  
  // If we reach here, validation passed
  return { success: true, data };
});
