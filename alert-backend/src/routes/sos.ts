import { Hono } from 'hono'
import { query } from '../db'
import { authMiddleware, getUserId } from '../middleware/auth'

const app = new Hono()

app.post('/alert', authMiddleware, async (c) => {
  try {
    const { latitude, longitude, contactName } = await c.req.json()
    await query('INSERT INTO sos_alerts (user_id,alert_type,latitude,longitude,target_contact) VALUES ($1,$2,$3,$4,$5)', [getUserId(c), 'sos', latitude, longitude, contactName || null])
    return c.json({ ok: true, message: 'SOS enviado' })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/family-panic', authMiddleware, async (c) => {
  try {
    const { latitude, longitude } = await c.req.json()
    await query('INSERT INTO sos_alerts (user_id,alert_type,latitude,longitude) VALUES ($1,$2,$3,$4)', [getUserId(c), 'family_panic', latitude, longitude])
    return c.json({ ok: true, message: 'Alerta familiar enviado' })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.get('/contacts', authMiddleware, async (c) => {
  try {
    const result = await query('SELECT * FROM sos_contacts WHERE user_id=$1', [getUserId(c)])
    return c.json(result.rows)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/contacts', authMiddleware, async (c) => {
  try {
    const { contactName, phoneNumber } = await c.req.json()
    if (!contactName || !phoneNumber) return c.json({ error: 'Campos obrigatórios' }, 400)
    const result = await query('INSERT INTO sos_contacts (user_id,contact_name,phone_number) VALUES ($1,$2,$3) RETURNING *', [getUserId(c), contactName, phoneNumber])
    return c.json(result.rows[0], 201)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

export default app
