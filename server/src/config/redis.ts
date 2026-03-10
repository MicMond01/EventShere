import { createClient, RedisClientType } from 'redis';

let client: RedisClientType;

export function getRedis(): RedisClientType {
  if (!client) throw new Error('Redis not connected');
  return client;
}

export async function connectRedis(): Promise<void> {
  client = createClient({
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: Number(process.env.REDIS_PORT) || 6379,
    },
  }) as RedisClientType;

  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  console.log('✅ Redis connected');
}

// Convenience helpers
export async function setCache(key: string, value: unknown, ttlSeconds = 3600) {
  await getRedis().setEx(key, ttlSeconds, JSON.stringify(value));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const data = await getRedis().get(key);
  return data ? (JSON.parse(data) as T) : null;
}

export async function deleteCache(key: string) {
  await getRedis().del(key);
}
