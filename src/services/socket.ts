import { io, Socket } from 'socket.io-client'

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000'

let socket: Socket | null = null

export function getSocket(): Socket {
  if (!socket) {
    socket = io(API_URL, {
      transports: ['websocket'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    })

    socket.on('connect', () => {
      console.log('[WS] Connected:', socket?.id)
    })

    socket.on('disconnect', (reason) => {
      console.log('[WS] Disconnected:', reason)
    })

    socket.on('connect_error', (err) => {
      console.warn('[WS] Connection error:', err.message)
    })
  }
  return socket
}

export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function joinRoom(roomId: string): void {
  getSocket().emit('room:join', roomId)
}

export function leaveRoom(roomId: string): void {
  getSocket().emit('room:leave', roomId)
}
