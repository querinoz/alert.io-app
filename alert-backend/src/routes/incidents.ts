import { Hono } from 'hono'
import { query } from '../db'
import { authMiddleware, getUserId } from '../middleware/auth'
import { getCached, setCache, invalidateCache } from '../lib/redis'

const app = new Hono()

app.get('/', async (c) => {
  try {
    const cached = await getCached<unknown[]>('incidents:active')
    if (cached) return c.json(cached)
    const result = await query("SELECT * FROM incidents WHERE status='active' ORDER BY created_at DESC LIMIT 200")
    await setCache('incidents:active', result.rows, 30)
    return c.json(result.rows)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/', authMiddleware, async (c) => {
  try {
    const { title, description, category, severity, latitude, longitude, photoUrl } = await c.req.json()
    if (!title || !latitude || !longitude) return c.json({ error: 'Campos obrigatórios: title, latitude, longitude' }, 400)
    const userId = getUserId(c)
    const result = await query(
      'INSERT INTO incidents (user_id,title,description,category,severity,latitude,longitude,photo_url) VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *',
      [userId, title, description || '', category || 'other', severity || 'medium', latitude, longitude, photoUrl || null]
    )
    await query('UPDATE users SET total_reports=total_reports+1, reports_today=reports_today+1, reputation=reputation+10 WHERE id=$1', [userId])
    await invalidateCache('incidents:*')
    return c.json(result.rows[0], 201)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.patch('/:id/confirm', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const userId = getUserId(c)
    await query('INSERT INTO incident_votes (incident_id,user_id,vote) VALUES ($1,$2,$3) ON CONFLICT(incident_id,user_id) DO UPDATE SET vote=$3', [id, userId, 'confirm'])
    await query('UPDATE incidents SET confirm_count=(SELECT count(*) FROM incident_votes WHERE incident_id=$1 AND vote=$2) WHERE id=$1', [id, 'confirm'])
    await query('UPDATE users SET total_confirmations=total_confirmations+1, reputation=reputation+2 WHERE id=$1', [userId])
    return c.json({ ok: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.patch('/:id/deny', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const userId = getUserId(c)
    await query('INSERT INTO incident_votes (incident_id,user_id,vote) VALUES ($1,$2,$3) ON CONFLICT(incident_id,user_id) DO UPDATE SET vote=$3', [id, userId, 'deny'])
    await query('UPDATE incidents SET deny_count=(SELECT count(*) FROM incident_votes WHERE incident_id=$1 AND vote=$2) WHERE id=$1', [id, 'deny'])
    return c.json({ ok: true })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.get('/:id/comments', async (c) => {
  try {
    const result = await query('SELECT c.*, u.display_name FROM incident_comments c JOIN users u ON c.user_id=u.id WHERE c.incident_id=$1 ORDER BY c.created_at DESC LIMIT 50', [c.req.param('id')])
    return c.json(result.rows)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/:id/comments', authMiddleware, async (c) => {
  try {
    const { text } = await c.req.json()
    if (!text || text.length > 200) return c.json({ error: 'Comentário obrigatório (máx 200 caracteres)' }, 400)
    const result = await query('INSERT INTO incident_comments (incident_id,user_id,text) VALUES ($1,$2,$3) RETURNING *', [c.req.param('id'), getUserId(c), text])
    return c.json(result.rows[0], 201)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

export default app
