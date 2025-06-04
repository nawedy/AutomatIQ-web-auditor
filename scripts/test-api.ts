// scripts/test-api.ts
// Test script for API routes

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('🔍 Testing API routes and database connections...');
    
    // Create a test user if it doesn't exist
    const testEmail = 'test@example.com';
    let user = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (!user) {
      console.log('👤 Creating test user...');
      user = await prisma.user.create({
        data: {
          name: 'Test User',
          email: testEmail,
        }
      });
      console.log(`✅ Created test user with ID: ${user.id}`);
    } else {
      console.log(`✅ Found existing test user with ID: ${user.id}`);
    }
    
    // Create a test website if it doesn't exist
    const testUrl = 'https://example.com';
    let website = await prisma.website.findFirst({
      where: {
        url: testUrl,
        userId: user.id
      }
    });
    
    if (!website) {
      console.log('🌐 Creating test website...');
      website = await prisma.website.create({
        data: {
          name: 'Example Website',
          url: testUrl,
          userId: user.id,
        }
      });
      console.log(`✅ Created test website with ID: ${website.id}`);
    } else {
      console.log(`✅ Found existing test website with ID: ${website.id}`);
    }
    
    // Create a test audit if it doesn't exist
    let audit = await prisma.audit.findFirst({
      where: {
        websiteId: website.id
      }
    });
    
    if (!audit) {
      console.log('📊 Creating test audit...');
      audit = await prisma.audit.create({
        data: {
          status: 'completed',
          websiteId: website.id,
          completedAt: new Date()
        }
      });
      console.log(`✅ Created test audit with ID: ${audit.id}`);
      
      // Create a test audit summary
      console.log('📑 Creating test audit summary...');
      const summary = await prisma.auditSummary.create({
        data: {
          auditId: audit.id,
          overallScore: 85,
          summaryReport: {
            totalPages: 5,
            totalIssues: 12,
            highSeverityIssues: 2,
            mediumSeverityIssues: 5,
            lowSeverityIssues: 5
          }
        }
      });
      console.log(`✅ Created test audit summary with ID: ${summary.id}`);
      
      // First create audit categories
      console.log('🏷️ Creating test audit categories...');
      const categoryData = [
        { name: 'SEO', description: 'Search Engine Optimization' },
        { name: 'Performance', description: 'Website Performance' },
        { name: 'Accessibility', description: 'Website Accessibility' },
        { name: 'Security', description: 'Website Security' },
        { name: 'Mobile UX', description: 'Mobile User Experience' },
        { name: 'Content', description: 'Website Content' }
      ];
      
      const categories = [];
      
      for (const cat of categoryData) {
        // Check if category exists
        let category = await prisma.auditCategory.findUnique({
          where: { name: cat.name }
        });
        
        if (!category) {
          category = await prisma.auditCategory.create({
            data: cat
          });
        }
        
        categories.push(category);
      }
      console.log('✅ Created test categories');
      
      // Create audit checks
      console.log('🔍 Creating test audit checks...');
      const checks = [];
      
      for (let i = 0; i < categories.length; i++) {
        for (let j = 0; j < 3; j++) {
          const check = await prisma.auditCheck.create({
            data: {
              categoryId: categories[i].id,
              name: `${categories[i].name} Check ${j+1}`,
              description: `Test check ${j+1} for ${categories[i].name}`,
              weight: j+1
            }
          });
          checks.push(check);
        }
      }
      console.log('✅ Created test audit checks');
      
      // Create test audit results
      console.log('🔍 Creating test audit results...');
      const statuses = ['failed', 'warning', 'passed'];
      
      for (let i = 0; i < checks.length; i++) {
        await prisma.auditResult.create({
          data: {
            auditId: audit.id,
            checkId: checks[i].id,
            status: statuses[i % 3],
            score: Math.floor(Math.random() * 100),
            details: { message: `Test result for ${checks[i].name}` }
          }
        });
      }
      console.log('✅ Created test audit results');
      
      // Create test pages
      console.log('📄 Creating test pages...');
      const pages = [];
      
      for (let i = 0; i < 5; i++) {
        const pageUrl = i === 0 ? testUrl : `${testUrl}/page-${i}`;
        const page = await prisma.page.create({
          data: {
            websiteId: website.id,
            url: pageUrl,
            title: i === 0 ? 'Homepage' : `Page ${i}`
          }
        });
        pages.push(page);
      }
      console.log('✅ Created test pages');
      
      // Create page audit results
      console.log('📊 Creating page audit results...');
      
      for (let i = 0; i < pages.length; i++) {
        for (let j = 0; j < 3; j++) { // Use just 3 checks per page for simplicity
          await prisma.pageAuditResult.create({
            data: {
              auditId: audit.id,
              pageId: pages[i].id,
              checkId: checks[j].id,
              status: statuses[(i + j) % 3],
              score: Math.floor(Math.random() * 100),
              details: { message: `Page result for ${pages[i].url} check ${j+1}` }
            }
          });
        }
      }
      console.log('✅ Created page audit results');
    } else {
      console.log(`✅ Found existing test audit with ID: ${audit.id}`);
    }
    
    console.log('✅ All test data created successfully!');
    console.log('\nTest credentials:');
    console.log('Email: test@example.com');
    console.log('Password: password123');
    console.log('\nTest website URL: https://example.com');
    console.log(`Test audit ID: ${audit.id}`);
    
  } catch (error) {
    console.error('❌ Error during API testing:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
