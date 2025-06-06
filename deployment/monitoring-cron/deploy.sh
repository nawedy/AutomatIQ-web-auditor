#!/bin/bash
# Deployment script for monitoring cron job

echo "=== Creating AutomatIQ Monitoring Cron Job Deployment Package ===
"

# Create necessary directories
echo "Creating directory structure..."
mkdir -p deployment/monitoring-cron/app/api/cron/run-monitoring-checks
mkdir -p deployment/monitoring-cron/lib/services
mkdir -p deployment/monitoring-cron/scripts

# Copy API route
echo "Copying API route files..."
cp -r app/api/cron/run-monitoring-checks/* deployment/monitoring-cron/app/api/cron/run-monitoring-checks/

# Copy service adapter and dependencies
echo "Copying service files..."
cp lib/services/monitoring-service-adapter.ts deployment/monitoring-cron/lib/services/
cp lib/logger.ts deployment/monitoring-cron/lib/

# Copy test scripts
echo "Copying test scripts..."
cp scripts/test-monitoring-endpoint.ts deployment/monitoring-cron/scripts/
cp scripts/verify-monitoring-adapter.ts deployment/monitoring-cron/scripts/

# Copy necessary configuration files
echo "Copying configuration files..."
cp package.json deployment/monitoring-cron/
cp tsconfig.json deployment/monitoring-cron/
cp .env.local deployment/monitoring-cron/ 2>/dev/null || echo "No .env.local file found"
cp .env deployment/monitoring-cron/ 2>/dev/null || echo "No .env file found"

# Create a README file
cat > deployment/monitoring-cron/README.md << 'EOF'
# AutomatIQ Monitoring Cron Job

This package contains the necessary files to deploy the AutomatIQ monitoring cron job to Vercel.

## Deployment Instructions

### Prerequisites
- Vercel CLI installed: `npm i -g vercel`
- Vercel account with access to the AutomatIQ project
- Node.js and npm installed

### Deployment Steps

1. Install dependencies:
   ```bash
   npm install
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy to Vercel:
   ```bash
   vercel --prod
   ```

4. Verify the deployment:
   ```bash
   # Install ts-node and dotenv for running the test script
   npm install -g ts-node dotenv
   
   # Run the test script
   ts-node scripts/test-monitoring-endpoint.ts
   ```

## Configuration

Make sure the following environment variables are set in your Vercel project:

- `CRON_SECRET`: Secret key for authenticating cron job requests
- `DATABASE_URL`: PostgreSQL connection string
- `NEXT_PUBLIC_APP_URL`: URL of the application

## Cron Schedule

The monitoring checks run every 15 minutes as configured in `vercel.json`.

## Testing

Two test scripts are included:

1. `scripts/test-monitoring-endpoint.ts` - Tests the API endpoint with proper authorization
2. `scripts/verify-monitoring-adapter.ts` - Verifies the adapter functionality with the database

To run the endpoint test:
```bash
ts-node scripts/test-monitoring-endpoint.ts
```

## Troubleshooting

If you encounter any issues:

1. Check Vercel logs for errors
2. Verify environment variables are correctly set
3. Ensure the database connection is working
4. Test the endpoint manually using curl:
   ```bash
   curl -X GET "https://your-app-url.vercel.app/api/cron/run-monitoring-checks" \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
EOF

# Create a deployment guide
cat > deployment/monitoring-cron/DEPLOYMENT.md << 'EOF'
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
EOF

# Create a production-ready .env.example file
cat > deployment/monitoring-cron/.env.example << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
POSTGRES_URL_NON_POOLING=postgresql://user:password@host:port/database?sslmode=require

# Application Configuration
NEXT_PUBLIC_APP_URL=https://your-app-url.vercel.app

# Security
CRON_SECRET=your-secure-secret-key

# Logging
LOG_LEVEL=info
EOF

echo -e "\n=== Deployment Package Created Successfully! ===\n"
echo "📁 Location: deployment/monitoring-cron/"
echo "📝 Documentation: deployment/monitoring-cron/README.md"
echo "🚀 Deployment Guide: deployment/monitoring-cron/DEPLOYMENT.md"
echo -e "\nTo deploy:\n  cd deployment/monitoring-cron/\n  vercel --prod\n"
