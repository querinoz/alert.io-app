import { Server as IOServer } from 'socket.io'
import type { Server as HttpServer } from 'http'
import { createAdapter } from '@socket.io/redis-adapter'
import { redis } from '../lib/redis'

export async function setupWebSocket(httpServer: HttpServer, corsOrigins: string[]) {
  const io = new IOServer(httpServer, {
    cors: { origin: corsOrigins, methods: ['GET', 'POST'] },
    transports: ['websocket', 'polling'],
  })

  try {
    await redis.connect()
    const pubClient = redis.duplicate()
    const subClient = redis.duplicate()
    await Promise.all([pubClient.connect(), subClient.connect()])
    io.adapter(createAdapter(pubClient, subClient))
    console.log('[WS] Redis adapter attached for pub/sub')
  } catch (err) {
    console.warn('[WS] Redis unavailable, running without adapter:', (err as Error).message)
  }

  io.on('connection', (socket) => {
    console.log(`[WS] Client connected: ${socket.id}`)

    socket.on('location:update', (data: { userId: string; lat: number; lng: number }) => {
      socket.broadcast.emit(`location:${data.userId}`, data)
    })

    socket.on('sos:trigger', (data: { userId: string; lat: number; lng: number }) => {
      io.emit('sos:alert', data)
    })

    socket.on('incident:new', (data) => {
      io.emit('incident:broadcast', data)
    })

    socket.on('incident:vote', (data: { incidentId: string; vote: string; counts: { confirm: number; deny: number } }) => {
      io.emit('incident:vote:update', data)
    })

    socket.on('camera:status', (data: { cameraId: string; status: string }) => {
      io.emit('camera:status:update', data)
    })

    socket.on('room:join', (roomId: string) => {
      socket.join(roomId)
    })

    socket.on('room:leave', (roomId: string) => {
      socket.leave(roomId)
    })

    socket.on('disconnect', () => {
      console.log(`[WS] Client disconnected: ${socket.id}`)
    })
  })

  return io
}
