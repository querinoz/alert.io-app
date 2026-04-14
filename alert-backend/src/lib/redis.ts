import Redis from 'ioredis'

export const redis = new Redis({
  host: process.env.REDIS_HOST ?? 'localhost',
  port: parseInt(process.env.REDIS_PORT ?? '6379', 10),
  lazyConnect: true,
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 10) return null
    return Math.min(times * 200, 2000)
  },
})

redis.on('error', (err) => console.error('[Redis] Connection error:', err.message))
redis.on('connect', () => console.log('[Redis] Connected'))

export async function getCached<T>(key: string): Promise<T | null> {
  const val = await redis.get(key)
  return val ? JSON.parse(val) : null
}

export async function setCache(key: string, data: unknown, ttlSeconds: number): Promise<void> {
  await redis.setex(key, ttlSeconds, JSON.stringify(data))
}

export async function invalidateCache(pattern: string): Promise<void> {
  const keys = await redis.keys(pattern)
  if (keys.length > 0) await redis.del(...keys)
}
