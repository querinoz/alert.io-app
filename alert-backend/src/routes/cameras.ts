import { Hono } from 'hono'
import { query } from '../db'
import { getCached, setCache } from '../lib/redis'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const cached = await getCached<unknown[]>('cameras:all')
    if (cached) return c.json(cached)
    const result = await query('SELECT * FROM public_cameras')
    await setCache('cameras:all', result.rows, 300)
    return c.json(result.rows)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

export default app
