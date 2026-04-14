import { Hono } from 'hono'
import { query } from '../db'
import { authMiddleware, getUserId, getUserEmail } from '../middleware/auth'

const app = new Hono()

app.get('/me', authMiddleware, async (c) => {
  try {
    const result = await query('SELECT id,email,display_name,reputation,level,is_guardian,is_ghost_mode,total_reports,total_confirmations,reports_today,daily_report_limit,verified_incidents,removed_incidents,mentees FROM users WHERE id=$1', [getUserId(c)])
    if (result.rows.length === 0) return c.json({ error: 'Usuário não encontrado' }, 404)
    const u = result.rows[0]
    return c.json({ id: u.id, email: u.email, displayName: u.display_name, reputation: u.reputation, level: u.level, isGuardian: u.is_guardian, isGhostMode: u.is_ghost_mode, totalReports: u.total_reports, totalConfirmations: u.total_confirmations, reportsToday: u.reports_today, dailyReportLimit: u.daily_report_limit, verifiedIncidents: u.verified_incidents, removedIncidents: u.removed_incidents, mentees: u.mentees })
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

app.post('/me/ensure', authMiddleware, async (c) => {
  try {
    const uid = getUserId(c)
    const email = getUserEmail(c)
    const { displayName } = await c.req.json()

    const existing = await query('SELECT id FROM users WHERE id=$1', [uid])
    if (existing.rows.length > 0) {
      const result = await query('SELECT id,email,display_name,reputation,level,is_guardian FROM users WHERE id=$1', [uid])
      const u = result.rows[0]
      return c.json({ id: u.id, email: u.email, displayName: u.display_name, reputation: u.reputation, level: u.level, isGuardian: u.is_guardian, created: false })
    }

    const result = await query(
      'INSERT INTO users (id, email, password_hash, display_name) VALUES ($1,$2,$3,$4) RETURNING id, email, display_name, reputation, level',
      [uid, email, 'firebase-managed', displayName || email.split('@')[0]]
    )
    const u = result.rows[0]
    return c.json({ id: u.id, email: u.email, displayName: u.display_name, reputation: u.reputation, level: u.level, created: true }, 201)
  } catch (e: any) { return c.json({ error: e.message }, 500) }
})

export default app
