# AutomatIQ Admin Dashboard Test Plan

## Bulk Export Feature Tests

### API Tests
- [ ] **POST /api/export/bulk**
  - [ ] Test with valid auditIds and PDF format
  - [ ] Test with valid auditIds and CSV format
  - [ ] Test with valid auditIds and ZIP format (combined PDF+CSV)
  - [ ] Test with invalid auditIds
  - [ ] Test with empty auditIds array
  - [ ] Test with invalid format
  - [ ] Test with unauthorized user
  - [ ] Test with user who doesn't have access to some audits

### UI Tests
- [ ] **BulkExport Component**
  - [ ] Test selecting/deselecting reports
  - [ ] Test "Select All" functionality
  - [ ] Test export button disabled state when no reports selected
  - [ ] Test PDF export
  - [ ] Test CSV export
  - [ ] Test ZIP export
  - [ ] Test progress indicator
  - [ ] Test error handling and display
  - [ ] Test success toast notification
  - [ ] Test download functionality

## Scheduled Audits Feature Tests

### API Tests
- [ ] **GET /api/cron/run-scheduled-audits**
  - [ ] Test with admin user
  - [ ] Test with non-admin user (should be unauthorized)
  - [ ] Verify statistics response format
  - [ ] Verify next scheduled audit date

- [ ] **POST /api/cron/run-scheduled-audits**
  - [ ] Test with valid CRON_SECRET header
  - [ ] Test without CRON_SECRET header
  - [ ] Test with invalid CRON_SECRET header
  - [ ] Verify processing of due scheduled audits
  - [ ] Verify response statistics

### UI Tests
- [ ] **AdminOverview Component**
  - [ ] Test loading state
  - [ ] Test tab switching
  - [ ] Test refresh functionality
  - [ ] Test "Run Now" button for scheduled audits
  - [ ] Verify statistics display
  - [ ] Verify recent activity display

## Comparative Analysis Feature Tests

### API Tests
- [ ] **GET /api/websites/[websiteId]/audits/history**
  - [ ] Test with valid websiteId and all time ranges (7days, 30days, 90days, all)
  - [ ] Test with invalid websiteId
  - [ ] Test with unauthorized user
  - [ ] Verify audit history response format
  - [ ] Verify statistics and improvement calculations

### UI Tests
- [ ] **ComparativeAnalysis Component**
  - [ ] Test loading state
  - [ ] Test time range selection
  - [ ] Test chart type switching (line/bar)
  - [ ] Test metric selection/toggling
  - [ ] Verify improvement calculations and display
  - [ ] Test audit selection from list

## Integration Tests

- [ ] **Admin Dashboard Page**
  - [ ] Test navigation between tabs
  - [ ] Verify AdminOverview component integration
  - [ ] Verify ComparativeAnalysis component integration
  - [ ] Test end-to-end workflow: view scheduled audits → run audits → view results → export reports

## Performance Tests

- [ ] **Bulk Export Performance**
  - [ ] Test with 5 audits
  - [ ] Test with 20 audits
  - [ ] Test with 50+ audits
  - [ ] Monitor memory usage during export operations
  - [ ] Monitor temporary file cleanup

- [ ] **Scheduled Audits Performance**
  - [ ] Test with 5 scheduled audits
  - [ ] Test with 20 scheduled audits
  - [ ] Test with 50+ scheduled audits
  - [ ] Monitor database connection handling

## Security Tests

- [ ] **Authentication & Authorization**
  - [ ] Verify all API routes are protected with withAuth middleware
  - [ ] Verify proper role-based access control (admin-only routes)
  - [ ] Verify CRON_SECRET protection for scheduled jobs
  - [ ] Test audit access restrictions (users can only access their own audits)

- [ ] **Data Validation**
  - [ ] Test input validation for all API routes
  - [ ] Test handling of malformed requests
  - [ ] Test handling of unexpected data types

## Browser Compatibility Tests

- [ ] **Desktop Browsers**
  - [ ] Chrome
  - [ ] Firefox
  - [ ] Safari
  - [ ] Edge

- [ ] **Mobile Browsers**
  - [ ] Chrome (Android)
  - [ ] Safari (iOS)

## Accessibility Tests

- [ ] Test keyboard navigation
- [ ] Test screen reader compatibility
- [ ] Test color contrast
- [ ] Test responsive design on different screen sizes

## Final Checklist

- [ ] All API routes return appropriate status codes
- [ ] All API routes handle errors gracefully
- [ ] All UI components show appropriate loading states
- [ ] All UI components handle errors gracefully
- [ ] All features are responsive on mobile devices
- [ ] All features are accessible
- [ ] All features are secure
- [ ] All features perform well with large datasets
