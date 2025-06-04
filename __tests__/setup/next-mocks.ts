// __tests__/setup/next-mocks.ts
// Common mocks for Next.js components used in tests

// Mock NextResponse before importing
jest.mock('next/server', () => {
  return {
    NextRequest: jest.fn().mockImplementation((url, options = {}) => {
      return {
        url,
        nextUrl: new URL(url),
        json: jest.fn().mockImplementation(async () => options.body ? JSON.parse(options.body as string) : {}),
      };
    }),
    NextResponse: {
      json: jest.fn().mockImplementation((body, options) => {
        return {
          status: options?.status || 200,
          json: async () => body,
        };
      }),
    },
  };
});

// Common auth utils mock
jest.mock('@/lib/auth-utils', () => ({
  withAuth: jest.fn((handler) => {
    return async (req: any, context: any) => {
      // Call the handler directly with the mock user
      const mockUser = { id: 'user-123', email: 'user@example.com' };
      return handler(req, context, mockUser);
    };
  }),
}));

// Common Prisma mock
jest.mock('@/lib/db', () => ({
  prisma: {
    audit: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    website: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    page: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    auditCategory: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    auditCheck: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    auditResult: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    pageAuditResult: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    auditSummary: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    auditCategoryScore: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      upsert: jest.fn(),
    },
    user: {
      findFirst: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
  },
}));

// Common PrismaAuditService mock
jest.mock('@/lib/services/prisma-audit-service', () => ({
  PrismaAuditService: jest.fn().mockImplementation(() => ({
    getAuditProgress: jest.fn(),
    getAuditResults: jest.fn(),
    getAuditSummary: jest.fn(),
  })),
}));

// Export common test utilities
export const mockUser = { id: 'user-123', email: 'user@example.com' };
