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
