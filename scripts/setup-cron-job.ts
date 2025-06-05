// src/scripts/setup-cron-job.ts
// Script to set up the cron jobs for processing scheduled audits and monitoring checks

import { exec } from 'child_process';
import { promisify } from 'util';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

const execAsync = promisify(exec);

// Load environment variables
dotenv.config({ path: '.env.local' });

const CRON_SECRET = process.env.CRON_SECRET;
const API_BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

if (!CRON_SECRET) {
  console.error('❌ CRON_SECRET environment variable is not set');
  console.error('Please add CRON_SECRET to your .env.local file');
  process.exit(1);
}

async function setupVercelCron() {
  try {
    console.log('🔄 Setting up Vercel Cron Jobs for scheduled audits and monitoring checks...');
    
    // Check if Vercel CLI is installed
    try {
      await execAsync('vercel --version');
    } catch (error) {
      console.error('❌ Vercel CLI is not installed');
      console.error('Please install Vercel CLI: npm i -g vercel');
      process.exit(1);
    }
    
    // Define the cron jobs to set up
    const cronJobs = [
      {
        path: '/api/cron/run-scheduled-audits',
        schedule: '0 */6 * * *', // Every 6 hours
      },
      {
        path: '/api/cron/run-monitoring-checks',
        schedule: '*/15 * * * *', // Every 15 minutes
      },
    ];
    
    // Create vercel.json if it doesn't exist
    const vercelJsonPath = path.join(process.cwd(), 'vercel.json');
    let vercelConfig: any = {
      version: 2,
      crons: cronJobs,
      headers: [
        {
          source: "/api/(.*)",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-XSS-Protection", value: "1; mode=block" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:;" }
          ]
        }
      ]
    };
    
    // If vercel.json exists, read it and update the crons section
    if (fs.existsSync(vercelJsonPath)) {
      const existingConfig = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf8'));
      vercelConfig = {
        ...existingConfig,
        crons: [
          ...(existingConfig.crons || []).filter((cron: any) => 
            cron.path !== "/api/cron/scheduled-audits" && 
            cron.path !== "/api/cron/run-monitoring-checks"
          ),
          {
            path: "/api/cron/scheduled-audits",
            schedule: "0 */6 * * *" // Run every 6 hours
          },
          {
            path: "/api/cron/run-monitoring-checks",
            schedule: "*/15 * * * *" // Run every 15 minutes
          }
        ]
      };
    }
    
    // Write the updated config to vercel.json
    fs.writeFileSync(vercelJsonPath, JSON.stringify(vercelConfig, null, 2));
    console.log('✅ Updated vercel.json with cron job configuration');
    
    // Test the cron job endpoints
    console.log('🧪 Testing scheduled audits endpoint...');
    try {
      const { stdout, stderr } = await execAsync(`curl -X GET "${API_BASE_URL}/api/cron/scheduled-audits" -H "Authorization: Bearer ${CRON_SECRET}"`);
      console.log('Response:', stdout);
      if (stderr) {
        console.error('Error:', stderr);
      }
    } catch (error) {
      console.error('❌ Failed to test scheduled audits endpoint:', error);
    }
    
    console.log('🧪 Testing monitoring checks endpoint...');
    try {
      const { stdout, stderr } = await execAsync(`curl -X GET "${API_BASE_URL}/api/cron/run-monitoring-checks" -H "Authorization: Bearer ${CRON_SECRET}"`);
      console.log('Response:', stdout);
      if (stderr) {
        console.error('Error:', stderr);
      }
    } catch (error) {
      console.error('❌ Failed to test monitoring checks endpoint:', error);
    }
    
    console.log('\n📋 Next steps:');
    console.log('1. Deploy your application to Vercel: vercel --prod');
    console.log('2. Verify that the cron job is set up in the Vercel dashboard');
    console.log('3. Monitor the cron job logs in the Vercel dashboard');
    
  } catch (error) {
    console.error('❌ Failed to set up Vercel Cron Job:', error);
    process.exit(1);
  }
}

// Execute the setup
setupVercelCron().catch(console.error);
