import { createServer } from 'node:http'
import { getRequestListener } from '@hono/node-server'
import app from './app'
import { setupWebSocket } from './websocket'

const port = parseInt(process.env.PORT ?? '3000', 10)
const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:8081,http://localhost:8080').split(',')

const httpServer = createServer(getRequestListener(app.fetch))

async function start() {
  const io = await setupWebSocket(httpServer, corsOrigins)

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`Alert.io API running on port ${port}`)
  })

  process.on('SIGTERM', () => {
    io.close()
    httpServer.close(() => process.exit(0))
  })
}

start().catch((err) => {
  console.error('Failed to start server:', err)
  process.exit(1)
})
