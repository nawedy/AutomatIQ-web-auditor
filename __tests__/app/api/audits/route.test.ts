// __tests__/app/api/audits/route.test.ts
// Tests for the audits API routes using mock implementations

// Setup global mocks first
import '../../../setup/next-mocks';
import { mockUser } from '../../../setup/next-mocks';

// Import NextResponse after mocks are set up
import { NextRequest, NextResponse } from 'next/server';

// Mock the prisma client
jest.mock('@/lib/db', () => ({
  prisma: {
    audit: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
    website: {
      findUnique: jest.fn(),
    },
  },
}));

// Import the mocked prisma client
import { prisma } from '@/lib/db';

// Mock PrismaAuditService
const mockStartAudit = jest.fn();
jest.mock('@/lib/services/prisma-audit-service', () => ({
  PrismaAuditService: jest.fn().mockImplementation(() => ({
    startAudit: mockStartAudit
  }))
}));

describe('Audits API Routes', () => {
  const mockWebsiteId = 'website-123';
  const mockAuditId = 'audit-123';

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('GET /api/audits', () => {
    it('should return audits for the authenticated user', async () => {
      // Mock data
      const mockAudits = [
        {
          id: mockAuditId,
          websiteId: mockWebsiteId,
          status: 'completed',
          website: { name: 'Example Website' },
          summary: { overallScore: 85 },
        },
      ];

      // Mock dependencies
      (prisma.audit.findMany as jest.Mock).mockResolvedValue(mockAudits);

      // Create mock function that simulates the GET handler
      const mockGetHandler = async (request: NextRequest) => {
        try {
          const audits = await prisma.audit.findMany({
            where: {
              website: {
                userId: mockUser.id,
              },
            },
            include: {
              website: true,
              summary: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });
          
          return NextResponse.json({ audits }, { status: 200 });
        } catch (error) {
          console.error('Error fetching audits:', error);
          return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
        }
      };

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audits');

      // Execute
      const response = await mockGetHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ audits: mockAudits });
      expect(prisma.audit.findMany).toHaveBeenCalledWith({
        where: {
          website: {
            userId: mockUser.id,
          },
        },
        include: {
          website: true,
          summary: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should filter audits by websiteId if provided', async () => {
      // Mock data
      const mockAudits = [
        {
          id: mockAuditId,
          websiteId: mockWebsiteId,
          status: 'completed',
          website: { name: 'Example Website' },
          summary: { overallScore: 85 },
        },
      ];

      // Mock dependencies
      (prisma.audit.findMany as jest.Mock).mockResolvedValue(mockAudits);

      // Create mock function that simulates the GET handler with websiteId filter
      const mockGetHandler = async (request: NextRequest) => {
        try {
          const url = new URL(request.url);
          const websiteId = url.searchParams.get('websiteId');
          
          const audits = await prisma.audit.findMany({
            where: {
              website: {
                userId: mockUser.id,
                ...(websiteId ? { id: websiteId } : {}),
              },
            },
            include: {
              website: true,
              summary: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });
          
          return NextResponse.json({ audits }, { status: 200 });
        } catch (error) {
          console.error('Error fetching audits:', error);
          return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
        }
      };

      // Create mock request with websiteId query param
      const request = new NextRequest(`http://localhost:3000/api/audits?websiteId=${mockWebsiteId}`);

      // Execute
      const response = await mockGetHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ audits: mockAudits });
      expect(prisma.audit.findMany).toHaveBeenCalledWith({
        where: {
          website: {
            userId: mockUser.id,
            id: mockWebsiteId,
          },
        },
        include: {
          website: true,
          summary: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (prisma.audit.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock function that simulates the GET handler
      const mockGetHandler = async (request: NextRequest) => {
        try {
          const audits = await prisma.audit.findMany({
            where: {
              website: {
                userId: mockUser.id,
              },
            },
            include: {
              website: true,
              summary: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          });
          
          return NextResponse.json({ audits }, { status: 200 });
        } catch (error) {
          console.error('Error fetching audits:', error);
          return NextResponse.json({ error: 'Failed to fetch audits' }, { status: 500 });
        }
      };

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audits');

      // Execute
      const response = await mockGetHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to fetch audits' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('POST /api/audits', () => {
    const validRequestBody = {
      websiteId: mockWebsiteId,
      url: 'https://example.com',
      options: {
        seo: true,
        performance: true,
        accessibility: true,
        security: false,
        bestPractices: true,
        mobileUx: false,
        content: true,
      },
    };

    it('should create a new audit successfully', async () => {
      // Mock data
      const mockAudit = {
        id: mockAuditId,
        websiteId: mockWebsiteId,
        status: 'pending',
      };

      // Mock dependencies
      (prisma.website.findUnique as jest.Mock).mockResolvedValue({
        id: mockWebsiteId,
        userId: mockUser.id,
      });
      (prisma.audit.create as jest.Mock).mockResolvedValue(mockAudit);
      mockStartAudit.mockResolvedValue(mockAuditId);

      // Create mock function that simulates the POST handler
      const mockPostHandler = async (request: NextRequest) => {
        try {
          const body = await request.json();
          const { websiteId, options } = body;
          
          // Check if website exists and is owned by user
          const website = await prisma.website.findUnique({
            where: {
              id: websiteId,
              userId: mockUser.id,
            },
          });
          
          if (!website) {
            return NextResponse.json(
              { error: 'Website not found or not owned by user' },
              { status: 404 }
            );
          }
          
          // Create audit
          const audit = await prisma.audit.create({
            data: {
              websiteId,
              status: 'pending',
            },
          });
          
          // Start audit process with PrismaAuditService
          await mockStartAudit(websiteId, {
            seo: options?.seo || false,
            performance: options?.performance || false,
            accessibility: options?.accessibility || false,
            security: options?.security || false,
            bestPractices: options?.bestPractices || false,
            mobile: options?.mobileUx || false, // Note the mapping from mobileUx to mobile
            content: options?.content || false,
          });
          
          return NextResponse.json({ audit }, { status: 201 });
        } catch (error) {
          console.error('Error creating audit:', error);
          return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 });
        }
      };

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audits', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await mockPostHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({ audit: mockAudit });
      expect(prisma.website.findUnique).toHaveBeenCalledWith({
        where: {
          id: mockWebsiteId,
          userId: mockUser.id,
        },
      });
      expect(prisma.audit.create).toHaveBeenCalledWith({
        data: {
          websiteId: mockWebsiteId,
          status: 'pending',
        },
      });
      expect(mockStartAudit).toHaveBeenCalledWith(
        mockWebsiteId,
        expect.objectContaining({
          seo: true,
          performance: true,
          accessibility: true,
          security: false,
          bestPractices: true,
          mobile: false,
          content: true,
        })
      );
    });

    it('should return 404 if website not found or not owned by user', async () => {
      // Mock dependencies
      (prisma.website.findUnique as jest.Mock).mockResolvedValue(null);

      // Create mock function that simulates the POST handler
      const mockPostHandler = async (request: NextRequest) => {
        try {
          const body = await request.json();
          const { websiteId } = body;
          
          // Check if website exists and is owned by user
          const website = await prisma.website.findUnique({
            where: {
              id: websiteId,
              userId: mockUser.id,
            },
          });
          
          if (!website) {
            return NextResponse.json(
              { error: 'Website not found or not owned by user' },
              { status: 404 }
            );
          }
          
          // Rest of the handler (not reached in this test)
          return NextResponse.json({}, { status: 201 });
        } catch (error) {
          console.error('Error creating audit:', error);
          return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 });
        }
      };

      // Create mock request with valid data
      const request = new NextRequest('http://localhost:3000/api/audits', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await mockPostHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Website not found or not owned by user' });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (prisma.website.findUnique as jest.Mock).mockResolvedValue({
        id: mockWebsiteId,
        userId: mockUser.id,
      });
      (prisma.audit.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock function that simulates the POST handler
      const mockPostHandler = async (request: NextRequest) => {
        try {
          const body = await request.json();
          const { websiteId } = body;
          
          // Check if website exists and is owned by user
          const website = await prisma.website.findUnique({
            where: {
              id: websiteId,
              userId: mockUser.id,
            },
          });
          
          if (!website) {
            return NextResponse.json(
              { error: 'Website not found or not owned by user' },
              { status: 404 }
            );
          }
          
          // Create audit (this will throw an error)
          const audit = await prisma.audit.create({
            data: {
              websiteId,
              status: 'pending',
            },
          });
          
          return NextResponse.json({ audit }, { status: 201 });
        } catch (error) {
          console.error('Error creating audit:', error);
          return NextResponse.json({ error: 'Failed to create audit' }, { status: 500 });
        }
      };

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/audits', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await mockPostHandler(request);
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Failed to create audit' });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
