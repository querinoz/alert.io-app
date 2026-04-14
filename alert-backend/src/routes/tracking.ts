import { Hono } from 'hono'
import { query } from '../db'
import { authMiddleware, getUserId } from '../middleware/auth'

const app = new Hono()

app.get('/', authMiddleware, async (c) => {
  try {
    const result = await query('SELECT * FROM tracked_items WHERE user_id=$1 ORDER BY last_updated DESC', [getUserId(c)])
    return c.json(result.rows)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/', authMiddleware, async (c) => {
  try {
    const { name, itemType, icon, latitude, longitude } = await c.req.json()
    if (!name || !itemType) return c.json({ error: 'Campos obrigatórios: name, itemType' }, 400)
    const result = await query(
      'INSERT INTO tracked_items (user_id,name,item_type,icon,latitude,longitude) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',
      [getUserId(c), name, itemType, icon || 'map-marker', latitude || null, longitude || null]
    )
    return c.json(result.rows[0], 201)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.patch('/:id/location', authMiddleware, async (c) => {
  try {
    const { latitude, longitude } = await c.req.json()
    await query('UPDATE tracked_items SET latitude=$1,longitude=$2,last_updated=NOW() WHERE id=$3 AND user_id=$4', [latitude, longitude, c.req.param('id'), getUserId(c)])
    return c.json({ ok: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.delete('/:id', authMiddleware, async (c) => {
  try {
    await query('DELETE FROM tracked_items WHERE id=$1 AND user_id=$2', [c.req.param('id'), getUserId(c)])
    return c.json({ ok: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

export default app
