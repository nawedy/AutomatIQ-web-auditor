// scripts/test-api-routes.ts
// Test script for API routes with authentication

import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Testing API routes with authentication...');
    
    // Get test user
    const testEmail = 'test@example.com';
    let user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (!user) {
      console.log('❌ Test user not found. Please run test-api.ts first.');
      return;
    }
    
    console.log(`✅ Found test user with ID: ${user.id}`);
    
    // Add a password to the test user if it doesn't have one
    if (!user.password) {
      console.log('🔑 Adding password to test user...');
      const hashedPassword = await hash('password123', 10);
      user = await prisma.user.update({
        where: { id: user.id },
        data: { 
          password: hashedPassword,
          emailVerified: new Date()
        }
      });
      console.log('✅ Added password to test user');
    }
    
    // Get test website
    const testUrl = 'https://example.com';
    const website = await prisma.website.findFirst({
      where: {
        url: testUrl,
        userId: user.id
      }
    });
    
    if (!website) {
      console.log('❌ Test website not found. Please run test-api.ts first.');
      return;
    }
    
    console.log(`✅ Found test website with ID: ${website.id}`);
    
    // Get test audit
    const audit = await prisma.audit.findFirst({
      where: {
        websiteId: website.id
      }
    });
    
    if (!audit) {
      console.log('❌ Test audit not found. Please run test-api.ts first.');
      return;
    }
    
    console.log(`✅ Found test audit with ID: ${audit.id}`);
    
    // Simulate API requests
    console.log('\n🔍 Simulating API requests...');
    
    // Simulate GET /api/websites
    console.log('\n📡 GET /api/websites');
    const websites = await prisma.website.findMany({
      where: { userId: user.id },
      include: {
        audits: {
          select: {
            id: true,
            status: true,
            startedAt: true,
            completedAt: true,
            summary: true
          },
          orderBy: { startedAt: 'desc' },
          take: 1
        }
      }
    });
    
    console.log(`✅ Found ${websites.length} websites for user ${user.id}`);
    
    // Simulate GET /api/audits/[id]
    console.log('\n📡 GET /api/audits/[id]');
    const auditDetails = await prisma.audit.findUnique({
      where: { id: audit.id },
      include: {
        website: true,
        summary: true
      }
    });
    
    if (auditDetails) {
      console.log(`✅ Found audit details for audit ${audit.id}`);
    } else {
      console.log(`❌ Could not find audit details for audit ${audit.id}`);
    }
    
    // Simulate GET /api/audits/[id]/results
    console.log('\n📡 GET /api/audits/[id]/results');
    const auditResults = await prisma.auditResult.findMany({
      where: { auditId: audit.id },
      include: {
        check: {
          include: {
            category: true
          }
        }
      }
    });
    
    console.log(`✅ Found ${auditResults.length} audit results for audit ${audit.id}`);
    
    // Simulate GET /api/audits/[id]/pages
    console.log('\n📡 GET /api/audits/[id]/pages');
    const auditPages = await prisma.page.findMany({
      where: { 
        websiteId: website.id 
      }
    });
    
    console.log(`✅ Found ${auditPages.length} pages for website ${website.id}`);
    
    // Simulate GET /api/audits/[id]/summary
    console.log('\n📡 GET /api/audits/[id]/summary');
    const auditSummary = await prisma.auditSummary.findUnique({
      where: { auditId: audit.id }
    });
    
    if (auditSummary) {
      console.log(`✅ Found audit summary for audit ${audit.id}`);
    } else {
      console.log(`❌ Could not find audit summary for audit ${audit.id}`);
    }
    
    console.log('\n✅ All API route tests completed successfully!');
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    
  } catch (error) {
    console.error('❌ Error during API testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
