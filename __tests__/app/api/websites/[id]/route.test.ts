// __tests__/app/api/websites/[id]/route.test.ts
// Tests for the specific website API route

// Import common mocks
import '../../../../setup/next-mocks';
import { mockUser } from '../../../../setup/next-mocks';
import { NextRequest } from 'next/server';
import { GET, PATCH, DELETE } from '@/app/api/websites/[id]/route';

// Mock database queries
jest.mock('@/lib/database', () => {
  const originalModule = jest.requireActual('../../../../setup/database-mocks');
  return {
    ...originalModule,
    websiteQueries: {
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };
});

// Import after mocking
import { websiteQueries } from '@/lib/database';

describe('Specific Website API Route', () => {
  const mockWebsiteId = 'website-123';
  const mockParams = { id: mockWebsiteId };

  beforeEach(() => {
    jest.clearAllMocks();
    // Silence console.error during tests
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  
  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  describe('GET /api/websites/[id]', () => {
    it('should return the website', async () => {
      // Mock data
      const mockWebsite = {
        id: mockWebsiteId,
        name: 'Example Website',
        url: 'https://example.com',
        user_id: mockUser.id,
        created_at: new Date(),
        updated_at: new Date(),
      };

      // Mock dependencies
      (websiteQueries.findById as jest.Mock).mockResolvedValue(mockWebsite);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/websites/${mockWebsiteId}`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({
        website: mockWebsite,
      });
      expect(websiteQueries.findById).toHaveBeenCalledWith(mockWebsiteId);
    });

    it('should return 404 if website not found', async () => {
      // Mock dependencies
      (websiteQueries.findById as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/websites/${mockWebsiteId}`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Website not found' });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (websiteQueries.findById as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/websites/${mockWebsiteId}`);

      // Execute
      const response = await GET(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('PATCH /api/websites/[id]', () => {
    const validRequestBody = {
      name: 'Updated Website Name',
      url: 'https://updated-example.com',
    };

    it('should update the website', async () => {
      // Mock data
      const mockUpdatedWebsite = {
        id: mockWebsiteId,
        name: 'Updated Website Name',
        url: 'https://updated-example.com',
        user_id: mockUser.id,
      };

      // Mock dependencies
      (websiteQueries.update as jest.Mock).mockResolvedValue(mockUpdatedWebsite);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/websites/${mockWebsiteId}`, {
        method: 'PATCH',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ website: mockUpdatedWebsite });
      expect(websiteQueries.update).toHaveBeenCalledWith(mockWebsiteId, validRequestBody);
    });

    it('should return 404 if website not found', async () => {
      // Mock dependencies
      (websiteQueries.update as jest.Mock).mockResolvedValue(null);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/websites/${mockWebsiteId}`, {
        method: 'PATCH',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(404);
      expect(data).toEqual({ error: 'Website not found' });
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (websiteQueries.update as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/websites/${mockWebsiteId}`, {
        method: 'PATCH',
        body: JSON.stringify(validRequestBody),
      });
      
      // Mock request.json() method
      request.json = jest.fn().mockResolvedValue(validRequestBody);

      // Execute
      const response = await PATCH(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(console.error).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/websites/[id]', () => {
    it('should delete the website', async () => {
      // Mock dependencies
      (websiteQueries.delete as jest.Mock).mockResolvedValue(undefined);

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/websites/${mockWebsiteId}`, {
        method: 'DELETE',
      });

      // Execute
      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(200);
      expect(data).toEqual({ message: 'Website deleted successfully' });
      expect(websiteQueries.delete).toHaveBeenCalledWith(mockWebsiteId);
    });

    it('should handle errors gracefully', async () => {
      // Mock dependencies to throw error
      (websiteQueries.delete as jest.Mock).mockRejectedValue(new Error('Database error'));

      // Create mock request
      const request = new NextRequest(`http://localhost:3000/api/websites/${mockWebsiteId}`, {
        method: 'DELETE',
      });

      // Execute
      const response = await DELETE(request, { params: mockParams });
      const data = await response.json();

      // Assert
      expect(response.status).toBe(500);
      expect(data).toEqual({ error: 'Internal server error' });
      expect(console.error).toHaveBeenCalled();
    });
  });
});
