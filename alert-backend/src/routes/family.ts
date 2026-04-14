import { Hono } from 'hono'
import { query } from '../db'
import { authMiddleware, getUserId } from '../middleware/auth'
import { v4 as uuid } from 'uuid'

const app = new Hono()

app.get('/groups', authMiddleware, async (c) => {
  try {
    const result = await query('SELECT g.* FROM family_groups g JOIN family_members m ON g.id=m.group_id WHERE m.user_id=$1', [getUserId(c)])
    return c.json(result.rows)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/groups', authMiddleware, async (c) => {
  try {
    const { name } = await c.req.json()
    const userId = getUserId(c)
    const inviteCode = uuid().slice(0, 8).toUpperCase()
    const result = await query('INSERT INTO family_groups (name,invite_code,owner_id) VALUES ($1,$2,$3) RETURNING *', [name || 'Minha Família', inviteCode, userId])
    const group = result.rows[0]
    const userRes = await query('SELECT display_name FROM users WHERE id=$1', [userId])
    await query('INSERT INTO family_members (group_id,user_id,role,display_name) VALUES ($1,$2,$3,$4)', [group.id, userId, 'admin', userRes.rows[0].display_name])
    return c.json(group, 201)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/join', authMiddleware, async (c) => {
  try {
    const { inviteCode } = await c.req.json()
    const userId = getUserId(c)
    const groupRes = await query('SELECT * FROM family_groups WHERE invite_code=$1', [inviteCode])
    if (groupRes.rows.length === 0) return c.json({ error: 'Código inválido' }, 404)
    const group = groupRes.rows[0]
    const userRes = await query('SELECT display_name FROM users WHERE id=$1', [userId])
    await query('INSERT INTO family_members (group_id,user_id,role,display_name) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING', [group.id, userId, 'member', userRes.rows[0].display_name])
    return c.json({ ok: true, group })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.get('/members', authMiddleware, async (c) => {
  try {
    const result = await query(
      'SELECT fm.* FROM family_members fm JOIN family_groups fg ON fm.group_id=fg.id JOIN family_members my ON my.group_id=fg.id WHERE my.user_id=$1',
      [getUserId(c)]
    )
    return c.json(result.rows)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.patch('/members/:id/location', authMiddleware, async (c) => {
  try {
    const { latitude, longitude, batteryLevel, isOnline } = await c.req.json()
    if (typeof latitude !== 'number' || typeof longitude !== 'number') {
      return c.json({ error: 'latitude and longitude must be numbers' }, 400)
    }
    const ownerCheck = await query(
      `SELECT fm.id FROM family_members fm
       JOIN family_groups fg ON fm.group_id = fg.id
       JOIN family_members my ON my.group_id = fg.id
       WHERE fm.id = $1 AND my.user_id = $2`,
      [c.req.param('id'), getUserId(c)]
    )
    if (ownerCheck.rows.length === 0) return c.json({ error: 'Acesso negado' }, 403)
    await query('UPDATE family_members SET latitude=$1,longitude=$2,battery_level=$3,is_online=$4,updated_at=NOW() WHERE id=$5',
      [latitude, longitude, batteryLevel, isOnline ?? true, c.req.param('id')])
    return c.json({ ok: true })
  } catch (e: any) { return c.json({ error: process.env.NODE_ENV === 'production' ? 'Internal error' : e.message }, 500) }
})

export default app
