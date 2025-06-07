// src/__tests__/components/audit/comparative-analysis.test.tsx
// Unit tests for the Comparative Analysis component

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ComparativeAnalysis } from '@/components/audit/comparative-analysis';
import { ComparativeAnalysisService } from '@/lib/services/comparative-analysis-service';

// Mock dependencies
jest.mock('@/lib/services/comparative-analysis-service', () => ({
  ComparativeAnalysisService: {
    getAuditHistory: jest.fn(),
    compareAudits: jest.fn(),
    analyzeScoreTrends: jest.fn(),
  },
}));

// Mock chart components
jest.mock('recharts', () => {
  const OriginalModule = jest.requireActual('recharts');
  return {
    ...OriginalModule,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-responsive-container">{children}</div>
    ),
    LineChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-line-chart">{children}</div>
    ),
    BarChart: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="mock-bar-chart">{children}</div>
    ),
    Line: () => <div data-testid="mock-line" />,
    Bar: () => <div data-testid="mock-bar" />,
    XAxis: () => <div data-testid="mock-xaxis" />,
    YAxis: () => <div data-testid="mock-yaxis" />,
    CartesianGrid: () => <div data-testid="mock-cartesian-grid" />,
    Tooltip: () => <div data-testid="mock-tooltip" />,
    Legend: () => <div data-testid="mock-legend" />,
  };
});

describe('ComparativeAnalysis', () => {
  const mockWebsiteId = 'website-123';
  const mockCurrentAuditId = 'audit-123';
  const mockAuditHistory = [
    {
      id: 'audit-123',
      createdAt: '2023-06-01T12:00:00Z',
      scores: {
        performance: 85,
        accessibility: 90,
        seo: 95,
        bestPractices: 88,
        overall: 90,
      },
    },
    {
      id: 'audit-122',
      createdAt: '2023-05-15T12:00:00Z',
      scores: {
        performance: 80,
        accessibility: 85,
        seo: 90,
        bestPractices: 85,
        overall: 85,
      },
    },
    {
      id: 'audit-121',
      createdAt: '2023-05-01T12:00:00Z',
      scores: {
        performance: 75,
        accessibility: 80,
        seo: 85,
        bestPractices: 80,
        overall: 80,
      },
    },
  ];
  
  const mockComparisonResult = {
    improvements: [
      { metric: 'performance', percentChange: 6.25 },
      { metric: 'accessibility', percentChange: 5.88 },
    ],
    declines: [],
    unchanged: [
      { metric: 'seo', percentChange: 0 },
    ],
    overallChange: { metric: 'overall', percentChange: 5.88 },
  };
  
  const mockTrendAnalysis = {
    trends: [
      { metric: 'performance', trend: 'improving', averageChange: 5 },
      { metric: 'accessibility', trend: 'improving', averageChange: 5 },
      { metric: 'seo', trend: 'stable', averageChange: 0 },
      { metric: 'bestPractices', trend: 'improving', averageChange: 4 },
      { metric: 'overall', trend: 'improving', averageChange: 5 },
    ],
    timeRange: '30 days',
  };
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock service methods
    (ComparativeAnalysisService.getAuditHistory as jest.Mock).mockResolvedValue(mockAuditHistory);
    (ComparativeAnalysisService.compareAudits as jest.Mock).mockResolvedValue(mockComparisonResult);
    (ComparativeAnalysisService.analyzeScoreTrends as jest.Mock).mockResolvedValue(mockTrendAnalysis);
  });

  it('renders loading state initially', () => {
    render(
      <ComparativeAnalysis 
        websiteId={mockWebsiteId} 
        currentAuditId={mockCurrentAuditId} 
      />
    );
    
    expect(screen.getByText(/loading audit history/i)).toBeInTheDocument();
  });

  it('fetches and displays audit history', async () => {
    render(
      <ComparativeAnalysis 
        websiteId={mockWebsiteId} 
        currentAuditId={mockCurrentAuditId} 
      />
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(ComparativeAnalysisService.getAuditHistory).toHaveBeenCalledWith(
        mockWebsiteId,
        expect.any(Object)
      );
    });
    
    // Check that trend analysis is displayed
    expect(screen.getByText(/performance trend/i)).toBeInTheDocument();
    expect(screen.getByText(/improving/i)).toBeInTheDocument();
    
    // Check that charts are rendered
    expect(screen.getByTestId('mock-line-chart')).toBeInTheDocument();
    expect(screen.getByTestId('mock-bar-chart')).toBeInTheDocument();
  });

  it('allows changing time range', async () => {
    render(
      <ComparativeAnalysis 
        websiteId={mockWebsiteId} 
        currentAuditId={mockCurrentAuditId} 
      />
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/last 30 days/i)).toBeInTheDocument();
    });
    
    // Change time range to 90 days
    fireEvent.click(screen.getByText(/last 30 days/i));
    fireEvent.click(screen.getByText(/last 90 days/i));
    
    // Verify that data is refetched with new time range
    await waitFor(() => {
      expect(ComparativeAnalysisService.getAuditHistory).toHaveBeenCalledWith(
        mockWebsiteId,
        expect.objectContaining({ days: 90 })
      );
    });
  });

  it('allows changing metric focus', async () => {
    render(
      <ComparativeAnalysis 
        websiteId={mockWebsiteId} 
        currentAuditId={mockCurrentAuditId} 
      />
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/overall score/i)).toBeInTheDocument();
    });
    
    // Change metric to Performance
    fireEvent.click(screen.getByText(/overall score/i));
    fireEvent.click(screen.getByText(/performance/i));
    
    // Verify that chart updates
    expect(screen.getByText(/performance trend/i)).toBeInTheDocument();
  });

  it('allows comparing with a specific audit', async () => {
    render(
      <ComparativeAnalysis 
        websiteId={mockWebsiteId} 
        currentAuditId={mockCurrentAuditId} 
      />
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText(/compare with/i)).toBeInTheDocument();
    });
    
    // Select an audit to compare with
    fireEvent.click(screen.getByText(/compare with/i));
    fireEvent.click(screen.getByText(/may 15, 2023/i));
    
    // Verify comparison is performed
    await waitFor(() => {
      expect(ComparativeAnalysisService.compareAudits).toHaveBeenCalledWith(
        mockCurrentAuditId,
        'audit-122'
      );
    });
    
    // Check that comparison results are displayed
    expect(screen.getByText(/performance.*\+6.25%/i)).toBeInTheDocument();
    expect(screen.getByText(/accessibility.*\+5.88%/i)).toBeInTheDocument();
  });

  it('handles error state', async () => {
    // Mock service error
    (ComparativeAnalysisService.getAuditHistory as jest.Mock).mockRejectedValue(
      new Error('Failed to fetch audit history')
    );
    
    render(
      <ComparativeAnalysis 
        websiteId={mockWebsiteId} 
        currentAuditId={mockCurrentAuditId} 
      />
    );
    
    // Wait for error state
    await waitFor(() => {
      expect(screen.getByText(/error loading audit history/i)).toBeInTheDocument();
    });
  });

  it('handles empty audit history', async () => {
    // Mock empty audit history
    (ComparativeAnalysisService.getAuditHistory as jest.Mock).mockResolvedValue([]);
    
    render(
      <ComparativeAnalysis 
        websiteId={mockWebsiteId} 
        currentAuditId={mockCurrentAuditId} 
      />
    );
    
    // Wait for no data state
    await waitFor(() => {
      expect(screen.getByText(/no historical audit data available/i)).toBeInTheDocument();
    });
  });

  it('displays improvement indicators correctly', async () => {
    render(
      <ComparativeAnalysis 
        websiteId={mockWebsiteId} 
        currentAuditId={mockCurrentAuditId} 
      />
    );
    
    // Wait for data to load
    await waitFor(() => {
      expect(ComparativeAnalysisService.compareAudits).toHaveBeenCalled();
    });
    
    // Check for improvement indicators
    const improvementElements = screen.getAllByText(/improving/i);
    expect(improvementElements.length).toBeGreaterThan(0);
    
    // Check for trend direction icons
    expect(screen.getAllByTestId('mock-line')).toBeTruthy();
  });
});
