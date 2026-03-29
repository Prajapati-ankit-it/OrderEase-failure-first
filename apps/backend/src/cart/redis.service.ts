/**
 * Redis Service
 * Reusable Redis operations with JSON serialization
 * Handles Redis connection and basic operations
 */

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit {
  private readonly logger = new Logger(RedisService.name);
  private redis: any; // Redis client
  private isInitialized = false;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.initializeRedis();
  }

  private async initializeRedis() {
    try {
      this.logger.log('Initializing Redis connection...');
      
      const redisConfig = {
        host: this.configService.get<string>('REDIS_HOST') || 'localhost',
        port: this.configService.get<number>('REDIS_PORT') || 6379,
        password: this.configService.get<string>('REDIS_PASSWORD') || undefined,
        retryDelayOnFailover: 100,
        maxRetriesPerRequest: 3,
        lazyConnect: true, // Don't connect immediately
        connectTimeout: 5000, // 5 seconds timeout
        commandTimeout: 3000, // 3 seconds timeout
      };

      this.logger.log(`Redis config: ${JSON.stringify({ ...redisConfig, password: redisConfig.password ? '***' : undefined })}`);

      this.redis = new Redis(redisConfig);

      this.redis.on('connect', () => {
        this.logger.log('Redis connected successfully');
        this.isInitialized = true;
      });

      this.redis.on('ready', () => {
        this.logger.log('Redis ready for operations');
      });

      this.redis.on('error', (err: Error) => {
        this.logger.error('Redis connection error', err);
        this.isInitialized = false;
      });

      this.redis.on('close', () => {
        this.logger.warn('Redis connection closed');
        this.isInitialized = false;
      });

      // Test connection with timeout
      await Promise.race([
        this.redis.connect(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis connection timeout')), 5000))
      ]);
      
      const pong = await Promise.race([
        this.redis.ping(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Redis ping timeout')), 3000))
      ]);
      
      this.logger.log(`Redis ping response: ${pong}`);
      
    } catch (error) {
      this.logger.error('Failed to initialize Redis', error);
      this.logger.warn('Application will continue without Redis caching. Cart operations will use database only.');
      this.redis = null;
      this.isInitialized = false;
    }
  }

  /**
   * Get value from Redis
   * @param key - Redis key
   * @returns Parsed JSON value or null
   */
  async get(key: string): Promise<any> {
    if (!this.redis || !this.isInitialized) {
      this.logger.warn(`Redis not available for GET operation on key: ${key}`);
      return null;
    }

    try {
      this.logger.debug(`Getting Redis key: ${key}`);
      const value = await this.redis.get(key);
      
      if (value === null) {
        this.logger.debug(`Redis key not found: ${key}`);
        return null;
      }
      
      this.logger.debug(`Redis key found: ${key}, value length: ${value.length}`);
      const parsed = JSON.parse(value);
      this.logger.debug(`Redis GET successful for key: ${key}`);
      return parsed;
    } catch (error) {
      this.logger.error(`Failed to get Redis key: ${key}`, error);
      return null;
    }
  }

  /**
   * Set value in Redis with TTL
   * @param key - Redis key
   * @param value - Value to store (will be JSON stringified)
   * @param ttl - Time to live in seconds (default: 7 days)
   * @returns True if successful
   */
  async set(key: string, value: any, ttl: number = 7 * 24 * 60 * 60): Promise<boolean> {
    if (!this.redis || !this.isInitialized) {
      this.logger.warn(`Redis not available for SET operation on key: ${key}`);
      return false;
    }

    try {
      const jsonString = JSON.stringify(value);
      this.logger.debug(`Setting Redis key: ${key}, TTL: ${ttl}s, value length: ${jsonString.length}`);
      
      const result = await this.redis.setex(key, ttl, jsonString);
      
      if (result === 'OK') {
        this.logger.debug(`Redis SET successful for key: ${key}`);
        return true;
      } else {
        this.logger.error(`Redis SET failed for key: ${key}, result: ${result}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to set Redis key: ${key}`, error);
      return false;
    }
  }

  /**
   * Delete key from Redis
   * @param key - Redis key
   * @returns True if successful
   */
  async del(key: string): Promise<boolean> {
    if (!this.redis || !this.isInitialized) {
      this.logger.warn(`Redis not available for DEL operation on key: ${key}`);
      return false;
    }

    try {
      this.logger.debug(`Deleting Redis key: ${key}`);
      const result = await this.redis.del(key);
      
      if (result > 0) {
        this.logger.debug(`Redis DEL successful for key: ${key}`);
        return true;
      } else {
        this.logger.warn(`Redis key not found for deletion: ${key}`);
        return false;
      }
    } catch (error) {
      this.logger.error(`Failed to delete Redis key: ${key}`, error);
      return false;
    }
  }

  /**
   * Check if Redis is available
   * @returns True if Redis is connected and available
   */
  isAvailable(): boolean {
    const available = this.redis !== null && this.isInitialized;
    this.logger.debug(`Redis availability check: ${available}`);
    return available;
  }

  /**
   * Add member to Redis set
   * @param key - Redis set key
   * @param member - Member to add
   * @returns True if successful
   */
  async sadd(key: string, member: string): Promise<boolean> {
    if (!this.redis || !this.isInitialized) {
      return false;
    }

    try {
      const result = await this.redis.sadd(key, member);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to add to Redis set: ${key}`, error);
      return false;
    }
  }

  /**
   * Get all members of Redis set
   * @param key - Redis set key
   * @returns Array of members
   */
  async smembers(key: string): Promise<string[]> {
    if (!this.redis || !this.isInitialized) {
      return [];
    }

    try {
      return await this.redis.smembers(key);
    } catch (error) {
      this.logger.error(`Failed to get Redis set members: ${key}`, error);
      return [];
    }
  }

  /**
   * Remove member from Redis set
   * @param key - Redis set key
   * @param member - Member to remove
   * @returns True if successful
   */
  async srem(key: string, member: string): Promise<boolean> {
    if (!this.redis || !this.isInitialized) {
      return false;
    }

    try {
      const result = await this.redis.srem(key, member);
      return result > 0;
    } catch (error) {
      this.logger.error(`Failed to remove from Redis set: ${key}`, error);
      return false;
    }
  }

  /**
   * Reset TTL for a key
   * @param key - Redis key
   * @param ttl - New TTL in seconds (default: 7 days)
   * @returns True if successful
   */
  async resetTTL(key: string, ttl: number = 7 * 24 * 60 * 60): Promise<boolean> {
    if (!this.redis) {
      return false;
    }

    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      this.logger.error(`Failed to reset TTL for Redis key: ${key}`, error);
      return false;
    }
  }

  /**
   * Close Redis connection
   */
  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }
}
