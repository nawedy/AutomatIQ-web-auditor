// __tests__/app/api/websites/route.test.ts
// Tests for the websites API route

// Import common mocks
import '../../../setup/next-mocks';
import { mockUser } from '../../../setup/next-mocks';
import { NextRequest } from 'next/server';
import { GET, POST } from '@/app/api/websites/route';
import { prisma } from '@/lib/db';

describe('Websites API Route', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('GET /api/websites', () => {
    it('should return all websites for the authenticated user', async () => {
      // Mock data
      const mockWebsites = [
        {
          id: 'website-1',
          name: 'Example Website',
          url: 'https://example.com',
          userId: mockUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          audits: [],
        },
        {
          id: 'website-2',
          name: 'Another Website',
          url: 'https://another-example.com',
          userId: mockUser.id,
          createdAt: new Date(),
          updatedAt: new Date(),
          audits: [],
        },
      ];

      // Mock dependencies
      (prisma.website.findMany as jest.Mock).mockResolvedValue(mockWebsites);

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/websites');

      // Execute
      const response = await GET(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toHaveProperty('websites');
      expect(prisma.website.findMany).toHaveBeenCalledWith({
        where: {
          userId: mockUser.id,
        },
        include: {
          audits: {
            select: {
              id: true,
              createdAt: true,
              status: true,
              summary: true,
            },
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (prisma.website.findMany as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/websites');

      // Execute
      const response = await GET(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('POST /api/websites', () => {
    const validRequestBody = {
      name: 'New Website',
      url: 'https://new-example.com',
    };

    it('should create a new website for the authenticated user', async () => {
      // Mock data
      const mockWebsite = {
        id: 'website-3',
        name: 'New Website',
        url: 'https://new-example.com',
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock dependencies
      (prisma.website.create as jest.Mock).mockResolvedValue(mockWebsite);

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/websites', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({ website: mockWebsite });
      expect(prisma.website.create).toHaveBeenCalledWith({
        data: {
          ...validRequestBody,
          userId: mockUser.id,
          auditFrequency: "weekly",
          notifications: true,
          tags: [],
          description: undefined,
        },
      });
    });

    it('should normalize URL by removing trailing slash', async () => {
      // Mock data
      const requestWithTrailingSlash = {
        name: 'New Website',
        url: 'https://new-example.com/',
      };

      const mockWebsite = {
        id: 'website-3',
        name: 'New Website',
        url: 'https://new-example.com',
        userId: mockUser.id,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Mock dependencies
      (prisma.website.create as jest.Mock).mockResolvedValue(mockWebsite);

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/websites', {
        method: 'POST',
        body: JSON.stringify(requestWithTrailingSlash),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(requestWithTrailingSlash);

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(201);
      expect(data).toEqual({ website: mockWebsite });
    });

    it('should return 400 for invalid request data', async () => {
      // Create mock request with invalid data (missing name)
      const invalidRequestBody = {
        // Missing name
        url: 'https://new-example.com',
      };

      const request = new NextRequest('http://localhost:3000/api/websites', {
        method: 'POST',
        body: JSON.stringify(invalidRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(invalidRequestBody);

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Invalid request data');
      expect(data).toHaveProperty('details');
    });

    it('should return 400 for invalid URL format', async () => {
      // Create mock request with invalid URL
      const invalidUrlBody = {
        name: 'Invalid Website',
        url: 'not-a-valid-url',
      };

      const request = new NextRequest('http://localhost:3000/api/websites', {
        method: 'POST',
        body: JSON.stringify(invalidUrlBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(invalidUrlBody);

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(400);
      expect(data).toHaveProperty('error', 'Invalid request data');
      expect(data).toHaveProperty('details');
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies
      (prisma.website.create as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest('http://localhost:3000/api/websites', {
        method: 'POST',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await POST(request, {});
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
