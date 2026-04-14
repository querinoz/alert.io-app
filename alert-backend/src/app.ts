import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'
import authRoutes from './routes/auth'
import incidentRoutes from './routes/incidents'
import familyRoutes from './routes/family'
import chainRoutes from './routes/chains'
import trackingRoutes from './routes/tracking'
import sosRoutes from './routes/sos'
import cameraRoutes from './routes/cameras'

const ALLOWED_ORIGINS = (process.env.CORS_ORIGINS || 'http://localhost:8081,http://localhost:8080').split(',')

const app = new Hono()

app.use('*', logger())
app.use('*', secureHeaders())
app.use('*', cors({
  origin: (origin) => ALLOWED_ORIGINS.includes(origin) ? origin : '',
  credentials: true,
}))

app.get('/health', (c) => c.json({ status: 'ok', version: '2.0.0' }))

app.route('/auth', authRoutes)
app.route('/incidents', incidentRoutes)
app.route('/family', familyRoutes)
app.route('/chains', chainRoutes)
app.route('/tracked-items', trackingRoutes)
app.route('/sos', sosRoutes)
app.route('/cameras', cameraRoutes)

app.notFound((c) => c.json({ error: 'Route not found' }, 404))

app.onError((err, c) => {
  if (err.message === 'Not allowed by CORS') {
    return c.json({ error: 'CORS not allowed' }, 403)
  }
  const status = (err as any).status || 500
  return c.json({ error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message }, status)
})

export default app
