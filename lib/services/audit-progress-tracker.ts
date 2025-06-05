// src/lib/services/audit-progress-tracker.ts
// Utility for tracking audit progress and reporting status

import { PrismaClient } from '@prisma/client';
import { AuditStatus } from '../types/advanced-audit';

export class AuditProgressTracker {
  private prisma: PrismaClient;
  private auditId: string;
  private totalSteps: number;
  private completedSteps: number = 0;
  private startTime: number;
  private lastUpdateTime: number;
  private status: AuditStatus = 'running';
  private currentCategory: string = '';
  
  constructor(prisma: PrismaClient, auditId: string, totalSteps: number) {
    this.prisma = prisma;
    this.auditId = auditId;
    this.totalSteps = totalSteps;
    this.startTime = Date.now();
    this.lastUpdateTime = this.startTime;
  }
  
  async initialize(): Promise<void> {
    // Update audit record with initial status
    await this.prisma.audit.update({
      where: { id: this.auditId },
      data: {
        status: 'running',
        startedAt: new Date(),
        progress: 0,
      },
    });
  }
  
  async updateProgress(category: string, step: number, message: string): Promise<void> {
    this.completedSteps = step;
    this.currentCategory = category;
    const progress = Math.min(Math.round((step / this.totalSteps) * 100), 99); // Cap at 99% until complete
    const currentTime = Date.now();
    
    // Only update the database if significant progress has been made or time has passed
    // This prevents too many database writes
    if (
      progress % 5 === 0 || // Update on every 5% increment
      currentTime - this.lastUpdateTime > 5000 // Or every 5 seconds
    ) {
      this.lastUpdateTime = currentTime;
      
      await this.prisma.audit.update({
        where: { id: this.auditId },
        data: {
          progress,
          currentCategory: category,
          statusMessage: message,
        },
      });
      
      // Log progress for debugging
      console.log(`Audit ${this.auditId} progress: ${progress}% - ${category} - ${message}`);
    }
  }
  
  async complete(success: boolean, message?: string): Promise<void> {
    const endTime = Date.now();
    const duration = endTime - this.startTime;
    
    this.status = success ? 'completed' : 'failed';
    
    await this.prisma.audit.update({
      where: { id: this.auditId },
      data: {
        status: this.status,
        completedAt: new Date(),
        progress: success ? 100 : this.completedSteps / this.totalSteps * 100,
        duration: Math.round(duration / 1000), // Duration in seconds
        statusMessage: message || (success ? 'Audit completed successfully' : 'Audit failed'),
      },
    });
    
    console.log(`Audit ${this.auditId} ${this.status} in ${Math.round(duration / 1000)}s - ${message || ''}`);
  }
  
  async fail(error: Error): Promise<void> {
    await this.complete(false, `Error: ${error.message}`);
  }
  
  getProgress(): number {
    return Math.round((this.completedSteps / this.totalSteps) * 100);
  }
  
  getStatus(): AuditStatus {
    return this.status;
  }
  
  getCurrentCategory(): string {
    return this.currentCategory;
  }
}
