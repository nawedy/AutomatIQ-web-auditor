// src/lib/db.ts
// Database client utility for AutomatIQ Web Auditor

import { PrismaClient } from '@prisma/client';
import { Pool } from '@neondatabase/serverless';

// Use existing Prisma client if available in development to prevent too many connections
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// Initialize Prisma Client with connection pooling for better performance
export const prisma = globalForPrisma.prisma ?? 
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Save the client in development to prevent too many connections
if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Create a Neon serverless pool for direct SQL queries when needed
export const neonPool = process.env.DATABASE_URL 
  ? new Pool({ connectionString: process.env.DATABASE_URL })
  : null;

/**
 * Execute a raw SQL query using the Neon serverless pool
 * @param sql SQL query to execute
 * @param params Query parameters
 * @returns Query result
 */
export async function executeRawQuery<T = any>(sql: string, params: any[] = []): Promise<T[]> {
  if (!neonPool) {
    throw new Error('Database connection not initialized');
  }
  
  try {
    const result = await neonPool.query(sql, params);
    return result.rows as T[];
  } catch (error) {
    console.error('Database query error:', error);
    throw error;
  }
}

/**
 * Set the current user ID for Row-Level Security
 * This should be called before performing database operations in authenticated contexts
 * @param userId The authenticated user's ID
 */
export async function setCurrentUserId(userId: string): Promise<void> {
  try {
    await prisma.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, false)`;
  } catch (error) {
    console.error('Failed to set current user ID:', error);
    throw error;
  }
}

/**
 * Helper function to handle database errors consistently
 * @param error The caught error
 * @param operation Description of the operation that failed
 */
export function handleDbError(error: unknown, operation: string): never {
  console.error(`Database error during ${operation}:`, error);
  
  // You can add custom error handling logic here
  if (error instanceof Error) {
    throw new Error(`Database operation failed: ${error.message}`);
  }
  
  throw new Error(`Unknown database error during ${operation}`);
}
