# AutomatIQ Monitoring System Documentation

## Overview

The AutomatIQ monitoring system provides continuous website monitoring capabilities with real-time alerts, performance tracking, and customizable notification settings. This document outlines the system architecture, components, and implementation details.

## Architecture

The monitoring system consists of the following components:

1. **MonitoringService**: Core service that handles all monitoring-related business logic
2. **MonitoringCache**: Redis-based caching layer for improved performance
3. **API Routes**: RESTful endpoints for frontend integration
4. **Cron Jobs**: Scheduled tasks for automated monitoring checks
5. **Frontend Components**: UI components for user interaction
6. **Notification System**: Multi-channel alert delivery system

## Core Components

### MonitoringService

The `MonitoringService` class (`lib/services/monitoring-service.ts`) is the central component responsible for:

- Retrieving and caching alerts
- Marking alerts as read
- Creating new alerts
- Checking website metrics against thresholds
- Scheduling monitoring checks
- Managing monitoring configuration

Key implementation details:
- Uses static methods from `MonitoringCache` for caching
- Uses `p-retry` for robust database operations with retry logic
- Implements proper TypeScript typing for alerts and monitoring data
- Handles alert severity calculation based on score drops and thresholds
- Integrates with `NotificationService` for sending alerts

### MonitoringCache

The `MonitoringCache` class provides Redis-based caching for:

- Alerts and alert counts
- Monitoring configurations
- Monitoring trends

Cache keys are structured with website ID and query parameters for efficient invalidation.

### API Routes

The monitoring system exposes the following API endpoints:

1. `/api/monitor/alerts`: Retrieve, mark as read, and manage alerts
2. `/api/monitor/config`: Retrieve and update monitoring configuration
3. `/api/monitor/continuous`: Get continuous monitoring data and trends
4. `/api/cron/run-monitoring-checks`: Cron endpoint for scheduled checks

All API routes implement:
- Authentication with `withAuth` middleware
- Rate limiting with `withRateLimit`
- Input validation
- Error handling
- Caching strategies

### Cron Jobs

The monitoring system uses scheduled cron jobs to:

1. Run periodic checks on monitored websites
2. Generate alerts when metrics fall below thresholds
3. Update monitoring schedules

Implementation:
- Vercel cron jobs configured in `vercel.json`
- Cron endpoints secured with API key authentication
- Configurable frequency based on monitoring settings

### Frontend Components

The monitoring dashboard consists of the following React components:

1. `monitoring-dashboard.tsx`: Main container component with tabbed interface
2. `monitoring-alerts.tsx`: Displays and manages alerts
3. `monitoring-config.tsx`: Configuration interface for monitoring settings
4. `monitoring-trends.tsx`: Visualizes performance trends over time

All components implement:
- TypeScript for type safety
- Responsive design with Tailwind CSS
- Error handling and loading states
- Real-time updates

### Notification System

Alerts are delivered through multiple channels:

1. In-app notifications
2. Email notifications
3. Webhook integrations (optional)

Notifications include:
- Severity indicators (INFO, WARNING, ERROR, CRITICAL)
- Metric details
- Timestamp
- Action links

## Database Schema

The monitoring system uses the following database models:

1. **MonitoringConfig**:
   - websiteId (PK, FK to Website)
   - enabled (boolean)
   - frequency (enum: HOURLY, DAILY, WEEKLY, BIWEEKLY, MONTHLY, QUARTERLY)
   - nextCheckAt (datetime)
   - metrics (array of strings)
   - alertThreshold (number)
   - createdAt, updatedAt (datetime)

2. **MonitoringAlert**:
   - id (PK)
   - websiteId (FK to Website)
   - userId (FK to User)
   - title (string)
   - message (string)
   - severity (enum: INFO, WARNING, ERROR, CRITICAL)
   - metric (string)
   - value (number)
   - threshold (number)
   - read (boolean)
   - createdAt, updatedAt (datetime)

3. **MonitoringCheck**:
   - id (PK)
   - websiteId (FK to Website)
   - startedAt, completedAt (datetime)
   - status (enum: PENDING, RUNNING, COMPLETED, FAILED)
   - results (JSON)
   - createdAt, updatedAt (datetime)

## Caching Strategy

The monitoring system implements a multi-level caching strategy:

1. **Redis Cache**:
   - Alert lists: 5-minute TTL
   - Alert counts: 2-minute TTL
   - Monitoring configs: 10-minute TTL
   - Monitoring trends: 30-minute TTL

2. **Cache Invalidation**:
   - Automatic invalidation on data updates
   - Targeted invalidation for specific website data
   - Bulk invalidation for user-level changes

## Error Handling

The monitoring system implements comprehensive error handling:

1. **API Routes**:
   - Try-catch blocks for all database operations
   - Appropriate HTTP status codes
   - Detailed error messages (in development)
   - Sanitized error messages (in production)

2. **Service Layer**:
   - Retry logic for transient database errors
   - Fallback mechanisms for cache misses
   - Error logging with context

3. **Frontend**:
   - Error boundaries for component isolation
   - Toast notifications for user feedback
   - Graceful degradation for failed requests

## Security Measures

The monitoring system implements the following security measures:

1. **Authentication**:
   - JWT-based authentication with NextAuth.js
   - API route protection with `withAuth` middleware

2. **Authorization**:
   - Row-level security in database queries
   - User-specific data access

3. **Rate Limiting**:
   - API route protection with `withRateLimit` middleware
   - Configurable limits based on endpoint sensitivity

4. **Cron Job Security**:
   - API key authentication for cron endpoints
   - Environment variable-based secrets

## Testing

The monitoring system includes the following testing approaches:

1. **Unit Tests**:
   - Service methods
   - Utility functions
   - Cache operations

2. **Integration Tests**:
   - API route functionality
   - Database interactions
   - Caching behavior

3. **End-to-End Tests**:
   - Complete monitoring workflow
   - Frontend component interactions

## Production Readiness Checklist

- [x] TypeScript compliance
- [x] Error handling
- [x] Caching strategy
- [x] Security measures
- [x] Rate limiting
- [x] Input validation
- [x] Logging
- [x] Documentation
- [ ] Comprehensive test coverage
- [ ] Performance optimization
- [ ] Scalability testing

## Deployment Configuration

The monitoring system is configured for deployment with:

1. **Vercel**:
   - Cron job configuration in `vercel.json`
   - Environment variable setup

2. **Database**:
   - Neon PostgreSQL for data storage
   - Connection pooling for optimal performance

3. **Redis**:
   - Upstash Redis for caching
   - TTL-based cache management

## Usage Examples

### Enabling Monitoring for a Website

```typescript
// Frontend component example
const enableMonitoring = async () => {
  const response = await fetch('/api/monitor/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      websiteId: 'website-id',
      enabled: true,
      frequency: 'DAILY',
      metrics: ['PERFORMANCE', 'SEO', 'ACCESSIBILITY'],
      alertThreshold: 10
    })
  });
  
  const data = await response.json();
  // Handle response
};
```

### Running a Manual Check

```typescript
// API route example
const monitoringService = new MonitoringService(prisma);
const alerts = await monitoringService.checkWebsiteMetrics('website-id');
```

### Retrieving Alerts

```typescript
// Service layer example
const monitoringService = new MonitoringService(prisma);
const alerts = await monitoringService.getAlertsFromCacheOrDatabase('website-id', { unreadOnly: true });
```

## Troubleshooting

Common issues and solutions:

1. **Monitoring checks not running**:
   - Verify cron job configuration in `vercel.json`
   - Check CRON_SECRET environment variable
   - Ensure monitoring is enabled for websites

2. **Missing alerts**:
   - Check alert threshold configuration
   - Verify metrics selection
   - Ensure notification channels are configured

3. **Performance issues**:
   - Check Redis cache configuration
   - Verify database connection pooling
   - Optimize database queries with proper indexes

## Future Enhancements

Planned improvements for the monitoring system:

1. **Advanced Metrics**:
   - Core Web Vitals tracking
   - Custom metric definitions
   - Competitive monitoring

2. **Machine Learning**:
   - Anomaly detection
   - Predictive alerts
   - Pattern recognition

3. **Integration Expansion**:
   - Slack notifications
   - Microsoft Teams integration
   - SMS alerts

4. **Reporting**:
   - Scheduled email reports
   - Custom dashboards
   - Export capabilities
