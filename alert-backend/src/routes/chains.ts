import { Hono } from 'hono'
import { query } from '../db'
import { authMiddleware, getUserId } from '../middleware/auth'
import { v4 as uuid } from 'uuid'

const app = new Hono()

app.get('/', authMiddleware, async (c) => {
  try {
    const result = await query('SELECT c.* FROM chains c JOIN chain_members cm ON c.id=cm.chain_id WHERE cm.user_id=$1', [getUserId(c)])
    return c.json(result.rows)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/', authMiddleware, async (c) => {
  try {
    const { name } = await c.req.json()
    const userId = getUserId(c)
    const inviteCode = uuid().slice(0, 8).toUpperCase()
    const result = await query('INSERT INTO chains (name,invite_code,owner_id) VALUES ($1,$2,$3) RETURNING *', [name || 'Minha Chain', inviteCode, userId])
    await query('INSERT INTO chain_members (chain_id,user_id,role) VALUES ($1,$2,$3)', [result.rows[0].id, userId, 'admin'])
    return c.json(result.rows[0], 201)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/join', authMiddleware, async (c) => {
  try {
    const { inviteCode } = await c.req.json()
    const chainRes = await query('SELECT * FROM chains WHERE invite_code=$1', [inviteCode])
    if (chainRes.rows.length === 0) return c.json({ error: 'Código inválido' }, 404)
    await query('INSERT INTO chain_members (chain_id,user_id,role) VALUES ($1,$2,$3) ON CONFLICT DO NOTHING', [chainRes.rows[0].id, getUserId(c), 'member'])
    return c.json({ ok: true, chain: chainRes.rows[0] })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.get('/:id/messages', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const memberCheck = await query('SELECT 1 FROM chain_members WHERE chain_id=$1 AND user_id=$2', [id, getUserId(c)])
    if (memberCheck.rows.length === 0) return c.json({ error: 'Não é membro desta cadeia' }, 403)
    const result = await query('SELECT m.*, u.display_name AS sender_name FROM chain_messages m JOIN users u ON m.sender_id=u.id WHERE m.chain_id=$1 ORDER BY m.created_at DESC LIMIT 100', [id])
    return c.json(result.rows)
  } catch (e: any) { return c.json({ error: process.env.NODE_ENV === 'production' ? 'Internal error' : e.message }, 500) }
})

app.post('/:id/messages', authMiddleware, async (c) => {
  try {
    const id = c.req.param('id')
    const userId = getUserId(c)
    const memberCheck = await query('SELECT 1 FROM chain_members WHERE chain_id=$1 AND user_id=$2', [id, userId])
    if (memberCheck.rows.length === 0) return c.json({ error: 'Não é membro desta cadeia' }, 403)
    const { text, msgType } = await c.req.json()
    if (!text || typeof text !== 'string' || text.trim().length === 0) return c.json({ error: 'Texto é obrigatório' }, 400)
    const validTypes = ['text', 'alert', 'location', 'sos', 'check_in', 'image']
    const type = validTypes.includes(msgType) ? msgType : 'text'
    const result = await query('INSERT INTO chain_messages (chain_id,sender_id,text,msg_type) VALUES ($1,$2,$3,$4) RETURNING *', [id, userId, text.trim(), type])
    return c.json(result.rows[0], 201)
  } catch (e: any) { return c.json({ error: process.env.NODE_ENV === 'production' ? 'Internal error' : e.message }, 500) }
})

export default app
