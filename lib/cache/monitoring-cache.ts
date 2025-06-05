// lib/cache/monitoring-cache.ts
// Redis-based caching layer for monitoring data to improve performance

import { Redis } from '@upstash/redis';
import { PrismaClient } from '@prisma/client';

// Define types for the cache based on Prisma models
type Alert = {
  id: string;
  websiteId: string;
  title: string;
  message: string;
  severity: string;
  category: string;
  url: string | null;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type MonitoringConfig = {
  id: string;
  websiteId: string;
  enabled: boolean;
  frequency: string;
  performanceThreshold: number;
  seoThreshold: number;
  accessibilityThreshold: number;
  bestPracticesThreshold: number;
  notifyEmail: boolean;
  notifySlack: boolean;
  slackWebhookUrl: string | null;
  emailRecipients: string[];
  createdAt: Date;
  updatedAt: Date;
};

// Initialize Redis client
const redis = Redis.fromEnv();

// Cache expiration times (in seconds)
const CACHE_TTL = {
  ALERTS: 60, // 1 minute
  ALERTS_COUNT: 60, // 1 minute
  CONFIG: 300, // 5 minutes
  TRENDS: 600, // 10 minutes
};

// Cache key prefixes
const CACHE_KEY = {
  ALERTS: 'monitoring:alerts:',
  ALERTS_COUNT: 'monitoring:alerts:count:',
  CONFIG: 'monitoring:config:',
  TRENDS: 'monitoring:trends:',
};

/**
 * Monitoring Cache Service
 * Provides caching for monitoring data to improve API performance
 */
export class MonitoringCache {
  /**
   * Get alerts from cache
   * @param websiteId Website ID
   * @param options Cache options (limit, offset, unreadOnly)
   * @returns Cached alerts or null if not cached
   */
  static async getAlerts(
    websiteId: string,
    options: { limit: number; offset: number; unreadOnly: boolean }
  ): Promise<Alert[] | null> {
    try {
      const cacheKey = `${CACHE_KEY.ALERTS}${websiteId}:${options.limit}:${options.offset}:${options.unreadOnly}`;
      const cachedAlerts = await redis.get<Alert[]>(cacheKey);
      return cachedAlerts;
    } catch (error) {
      console.error('Error getting alerts from cache:', error);
      return null;
    }
  }

  /**
   * Set alerts in cache
   * @param websiteId Website ID
   * @param alerts Alerts to cache
   * @param options Cache options (limit, offset, unreadOnly)
   */
  static async setAlerts(
    websiteId: string,
    alerts: Alert[],
    options: { limit: number; offset: number; unreadOnly: boolean }
  ): Promise<void> {
    try {
      const cacheKey = `${CACHE_KEY.ALERTS}${websiteId}:${options.limit}:${options.offset}:${options.unreadOnly}`;
      await redis.set(cacheKey, alerts, { ex: CACHE_TTL.ALERTS });
    } catch (error) {
      console.error('Error setting alerts in cache:', error);
    }
  }

  /**
   * Get alerts count from cache
   * @param websiteId Website ID
   * @param unreadOnly Whether to count only unread alerts
   * @returns Cached count or null if not cached
   */
  static async getAlertsCount(
    websiteId: string,
    unreadOnly: boolean
  ): Promise<number | null> {
    try {
      const cacheKey = `${CACHE_KEY.ALERTS_COUNT}${websiteId}:${unreadOnly}`;
      const cachedCount = await redis.get<number>(cacheKey);
      return cachedCount;
    } catch (error) {
      console.error('Error getting alerts count from cache:', error);
      return null;
    }
  }

  /**
   * Set alerts count in cache
   * @param websiteId Website ID
   * @param count Count to cache
   * @param unreadOnly Whether the count is for unread alerts only
   */
  static async setAlertsCount(
    websiteId: string,
    count: number,
    unreadOnly: boolean
  ): Promise<void> {
    try {
      const cacheKey = `${CACHE_KEY.ALERTS_COUNT}${websiteId}:${unreadOnly}`;
      await redis.set(cacheKey, count, { ex: CACHE_TTL.ALERTS_COUNT });
    } catch (error) {
      console.error('Error setting alerts count in cache:', error);
    }
  }

  /**
   * Get monitoring config from cache
   * @param websiteId Website ID
   * @returns Cached config or null if not cached
   */
  static async getConfig(websiteId: string): Promise<MonitoringConfig | null> {
    try {
      const cacheKey = `${CACHE_KEY.CONFIG}${websiteId}`;
      const cachedConfig = await redis.get<MonitoringConfig>(cacheKey);
      return cachedConfig;
    } catch (error) {
      console.error('Error getting config from cache:', error);
      return null;
    }
  }

  /**
   * Set monitoring config in cache
   * @param websiteId Website ID
   * @param config Config to cache
   */
  static async setConfig(
    websiteId: string,
    config: MonitoringConfig
  ): Promise<void> {
    try {
      const cacheKey = `${CACHE_KEY.CONFIG}${websiteId}`;
      await redis.set(cacheKey, config, { ex: CACHE_TTL.CONFIG });
    } catch (error) {
      console.error('Error setting config in cache:', error);
    }
  }

  /**
   * Invalidate all caches for a website
   * @param websiteId Website ID
   */
  static async invalidateWebsiteCache(websiteId: string): Promise<void> {
    try {
      // Get all keys for this website
      const keys = await redis.keys(`*${websiteId}*`);
      
      // Delete all keys
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Error invalidating website cache:', error);
    }
  }

  /**
   * Invalidate alerts cache for a website
   * @param websiteId Website ID
   */
  static async invalidateAlertsCache(websiteId: string): Promise<void> {
    try {
      // Get all alert keys for this website
      const alertKeys = await redis.keys(`${CACHE_KEY.ALERTS}${websiteId}*`);
      const countKeys = await redis.keys(`${CACHE_KEY.ALERTS_COUNT}${websiteId}*`);
      
      // Delete all keys
      const keys = [...alertKeys, ...countKeys];
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } catch (error) {
      console.error('Error invalidating alerts cache:', error);
    }
  }
}
