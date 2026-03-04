import Redis from "ioredis";

import { env } from "../config/env";

const globalForRedis = globalThis as {
  redis?: Redis;
};

export const redis =
  globalForRedis.redis ??
  new Redis(env.redisUrl, {
    lazyConnect: true,
    maxRetriesPerRequest: 1,
  });

if (env.nodeEnv !== "production") {
  globalForRedis.redis = redis;
}

async function ensureRedisConnection(): Promise<void> {
  if (redis.status === "ready" || redis.status === "connecting") {
    return;
  }

  await redis.connect();
}

export async function getCacheValue<T>(key: string): Promise<T | null> {
  try {
    await ensureRedisConnection();
    const value = await redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  } catch (error) {
    console.error("Redis read failed", error);
    return null;
  }
}

export async function setCacheValue<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  try {
    await ensureRedisConnection();
    await redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  } catch (error) {
    console.error("Redis write failed", error);
  }
}

export async function deleteCacheKeys(keys: string[]): Promise<void> {
  if (keys.length === 0) {
    return;
  }

  try {
    await ensureRedisConnection();
    await redis.del(...keys);
  } catch (error) {
    console.error("Redis delete failed", error);
  }
}
