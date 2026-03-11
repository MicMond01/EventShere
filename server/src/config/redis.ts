import { createClient, RedisClientType } from 'redis';
import { env } from './env';

let client: RedisClientType;

export function getRedis(): RedisClientType {
  if (!client) throw new Error('Redis not initialised — call connectRedis() first');
  return client;
}

export async function connectRedis(): Promise<void> {
  client = createClient({
    socket: { host: env.REDIS.HOST, port: env.REDIS.PORT },
  }) as RedisClientType;

  client.on('error', (err) => console.error('[Redis]', err));
  await client.connect();
  console.log('Redis connected');
}

export async function setCache(key: string, value: unknown, ttlSeconds = 3600): Promise<void> {
  await getRedis().setEx(key, ttlSeconds, JSON.stringify(value));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const raw = await getRedis().get(key);
  return raw ? (JSON.parse(raw) as T) : null;
}

export async function deleteCache(key: string): Promise<void> {
  await getRedis().del(key);
}
