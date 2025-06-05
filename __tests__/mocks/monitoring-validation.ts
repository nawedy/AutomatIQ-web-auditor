// __tests__/mocks/monitoring-validation.ts
// Mock implementation of monitoring validation utilities for testing

export const validateWebsiteAccess = jest.fn(async (prisma: any, websiteId: string, userId: string) => {
  if (websiteId === 'test-website-id') {
    return { success: true, website: { id: websiteId, name: 'Test Website', url: 'https://test.com' } };
  }
  
  if (!websiteId) {
    return { success: false, error: 'Website ID is required' };
  }
  
  if (websiteId === 'invalid-uuid') {
    return { success: false, error: 'Invalid website ID format' };
  }
  
  if (websiteId === 'not-found') {
    return { success: false, error: 'Website not found', status: 404 };
  }
  
  if (websiteId === 'unauthorized') {
    return { success: false, error: 'You do not have access to this website', status: 403 };
  }
  
  // Default success case for valid UUIDs
  return { success: true, website: { id: websiteId, name: 'Test Website', url: 'https://test.com' } };
});

export const validatePaginationParams = jest.fn((params: { limit?: string; offset?: string }) => {
  const { limit, offset } = params;
  
  const limitNum = limit ? parseInt(limit, 10) : 10;
  const offsetNum = offset ? parseInt(offset, 10) : 0;
  
  if (isNaN(limitNum) || limitNum <= 0) {
    return { success: false, error: 'Limit must be a positive number' };
  }
  
  if (isNaN(offsetNum) || offsetNum < 0) {
    return { success: false, error: 'Offset must be a non-negative number' };
  }
  
  return {
    success: true,
    pagination: {
      limit: limitNum,
      offset: offsetNum
    }
  };
});

export const validateAlertIds = jest.fn((alertIds: string[]) => {
  if (!alertIds || !Array.isArray(alertIds) || alertIds.length === 0) {
    return { success: false, error: 'Alert IDs are required' };
  }
  
  // Check if all alert IDs are valid UUIDs
  const invalidIds = alertIds.filter(id => {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !uuidRegex.test(id);
  });
  
  if (invalidIds.length > 0) {
    return { success: false, error: 'Invalid alert ID format' };
  }
  
  return { success: true, alertIds };
});

export const safeDisconnect = jest.fn(async (prisma: any) => {
  try {
    await prisma.$disconnect();
    return true;
  } catch (error) {
    console.error('Error disconnecting from Prisma:', error);
    return false;
  }
});
