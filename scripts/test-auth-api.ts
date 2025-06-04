// src/scripts/test-auth-api.ts
// Test script to verify authentication and API routes with Neon PostgreSQL

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import fetch from 'node-fetch';
import { v4 as uuidv4 } from 'uuid';

// Initialize Prisma client
const prisma = new PrismaClient();

// Test user credentials
const TEST_USER = {
  email: 'test@example.com',
  password: 'password123',
  name: 'Test User',
};

// Base URL for API requests
const API_BASE_URL = 'http://localhost:3000/api';

// Store auth cookies for subsequent requests
let authCookies: string[] = [];

/**
 * Main test function
 */
async function runTests() {
  console.log('🧪 Starting API and authentication tests...');
  
  try {
    // Clean up any existing test data
    await cleanupTestData();
    
    // Create test user
    const user = await createTestUser();
    console.log(`✅ Created test user: ${user.email} (${user.id})`);
    
    // Test login
    const loginResult = await testLogin();
    console.log('✅ Login successful:', loginResult.success);
    
    // Test user profile
    const profile = await testUserProfile();
    console.log('✅ User profile retrieved:', profile.user.email);
    
    // Create test website
    const website = await createTestWebsite(user.id);
    console.log(`✅ Created test website: ${website.url} (${website.id})`);
    
    // Test fetching websites
    const websites = await testGetWebsites();
    console.log(`✅ Retrieved ${websites.length} websites`);
    
    // Create test audit
    const audit = await createTestAudit(website.id);
    console.log(`✅ Created test audit for website: ${website.url} (${audit.id})`);
    
    // Test fetching audits
    const audits = await testGetAudits();
    console.log(`✅ Retrieved ${audits.length} audits`);
    
    // Test fetching specific audit
    const auditDetails = await testGetAuditById(audit.id);
    console.log(`✅ Retrieved audit details: ${auditDetails.id}`);
    
    console.log('\n🎉 All tests completed successfully!');
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    // Clean up test data
    await cleanupTestData();
    await prisma.$disconnect();
  }
}

/**
 * Clean up test data
 */
async function cleanupTestData() {
  // Find the test user
  const user = await prisma.user.findUnique({
    where: { email: TEST_USER.email },
    include: {
      websites: {
        include: {
          audits: {
            include: {
              auditResults: true,
              summary: true,
            },
          },
        },
      },
    },
  });

  if (user) {
    // Delete all related data in the correct order
    for (const website of user.websites) {
      for (const audit of website.audits) {
        // Delete audit results
        await prisma.auditResult.deleteMany({
          where: { auditId: audit.id },
        });
        
        // Delete audit summary
        if (audit.summary) {
          await prisma.auditSummary.delete({
            where: { id: audit.summary.id },
          });
        }
      }
      
      // Delete audits
      await prisma.audit.deleteMany({
        where: { websiteId: website.id },
      });
    }
    
    // Delete websites
    await prisma.website.deleteMany({
      where: { userId: user.id },
    });
    
    // Delete user
    await prisma.user.delete({
      where: { id: user.id },
    });
    
    console.log('🧹 Cleaned up test data');
  }
}

/**
 * Create a test user
 */
async function createTestUser() {
  // Hash the password
  const hashedPassword = await bcrypt.hash(TEST_USER.password, 10);
  
  // Create the user
  return await prisma.user.create({
    data: {
      email: TEST_USER.email,
      name: TEST_USER.name,
      password: hashedPassword,
      emailVerified: new Date(),
    },
  });
}

/**
 * Test login functionality
 */
async function testLogin() {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: TEST_USER.email,
      password: TEST_USER.password,
    }),
    redirect: 'manual',
  });
  
  // Store cookies for subsequent requests
  const cookies = response.headers.raw()['set-cookie'];
  if (cookies) {
    authCookies = cookies;
  }
  
  return { success: response.ok, status: response.status };
}

/**
 * Test getting user profile
 */
async function testUserProfile() {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Cookie: authCookies.join('; '),
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get user profile: ${response.status}`);
  }
  
  return await response.json();
}

/**
 * Create a test website
 */
async function createTestWebsite(userId: string) {
  return await prisma.website.create({
    data: {
      url: `https://test-${uuidv4().substring(0, 8)}.example.com`,
      name: 'Test Website',
      userId,
    },
  });
}

/**
 * Test getting websites
 */
async function testGetWebsites() {
  const response = await fetch(`${API_BASE_URL}/websites`, {
    headers: {
      Cookie: authCookies.join('; '),
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get websites: ${response.status}`);
  }
  
  const data = await response.json();
  return data.websites || [];
}

/**
 * Create a test audit
 */
async function createTestAudit(websiteId: string) {
  // Create directly in the database for simplicity
  return await prisma.audit.create({
    data: {
      websiteId,
      status: 'completed',
      startedAt: new Date(),
      completedAt: new Date(),
      summary: {
        create: {
          score: 85,
          passedChecks: 42,
          failedChecks: 7,
          warningChecks: 3,
        },
      },
    },
  });
}

/**
 * Test getting audits
 */
async function testGetAudits() {
  const response = await fetch(`${API_BASE_URL}/audits`, {
    headers: {
      Cookie: authCookies.join('; '),
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get audits: ${response.status}`);
  }
  
  const data = await response.json();
  return data.audits || [];
}

/**
 * Test getting audit by ID
 */
async function testGetAuditById(auditId: string) {
  const response = await fetch(`${API_BASE_URL}/audits/${auditId}`, {
    headers: {
      Cookie: authCookies.join('; '),
    },
  });
  
  if (!response.ok) {
    throw new Error(`Failed to get audit by ID: ${response.status}`);
  }
  
  const data = await response.json();
  return data.audit;
}

// Run the tests
runTests().catch(console.error);
