# AutomatIQ Monitoring Cron Job Deployment Guide

This guide provides detailed instructions for deploying the AutomatIQ monitoring cron job to production.

## 1. Prepare for Deployment

### Environment Variables

Create a `.env` file in the deployment directory with the following variables:

```
DATABASE_URL=postgresql://user:password@host:port/database
CRON_SECRET=your-secure-secret-key
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app
```

### Install Dependencies

```bash
npm install
```

## 2. Deploy to Vercel

### Using Vercel CLI

```bash
# Login to Vercel
vercel login

# Deploy to production
vercel --prod
```

### Using Vercel Dashboard

1. Create a new project in the Vercel dashboard
2. Connect to your Git repository
3. Configure the build settings:
   - Framework Preset: Next.js
   - Build Command: `npm run build`
   - Output Directory: `.next`
4. Add the environment variables
5. Deploy

## 3. Verify Deployment

### Test the API Endpoint

```bash
# Run the test script
ts-node scripts/test-monitoring-endpoint.ts
```

### Manual Testing

```bash
# Test the health check endpoint
curl -X GET "https://your-app-url.vercel.app/api/cron/run-monitoring-checks" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Run the monitoring checks
curl -X POST "https://your-app-url.vercel.app/api/cron/run-monitoring-checks" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 4. Monitor the Cron Job

1. Check Vercel logs for cron job execution
2. Verify that websites are being monitored correctly
3. Check for any errors in the logs

## 5. Troubleshooting

### Common Issues

1. **Authorization Errors**
   - Verify CRON_SECRET is correctly set
   - Check the Authorization header format

2. **Database Connection Issues**
   - Verify DATABASE_URL is correct
   - Check database permissions

3. **Cron Job Not Running**
   - Verify vercel.json configuration
   - Check Vercel cron logs
