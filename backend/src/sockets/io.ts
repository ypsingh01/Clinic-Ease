import type { Server as HttpServer } from 'node:http'
import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import type { AuthUser } from '../middleware/auth.js'
import { logger } from '../lib/logger.js'

let io: Server | null = null

export function initSockets(httpServer: HttpServer) {
  io = new Server(httpServer, {
    cors: {
      origin: env.CLIENT_ORIGIN.split(',').map((s) => s.trim()),
      credentials: true,
    },
  })

  io.use((socket, next) => {
    try {
      const token =
        (socket.handshake.auth?.token as string | undefined) ||
        (socket.handshake.headers.authorization?.startsWith('Bearer ')
          ? socket.handshake.headers.authorization.slice(7)
          : undefined)
      if (!token) return next(new Error('Unauthorized'))
      const user = jwt.verify(token, env.JWT_SECRET) as AuthUser
      socket.data.user = user
      next()
    } catch {
      next(new Error('Unauthorized'))
    }
  })

  io.on('connection', (socket) => {
    const user = socket.data.user as AuthUser
    logger.debug({ userId: user.id, role: user.role }, 'socket:connected')

    socket.on('queue:subscribe', (payload: { doctorId: string; date: string }) => {
      if (!payload?.doctorId || !payload?.date) return
      if (user.role === 'patient') {
        // Patients may watch clinic-wide updates only; queue rooms for staff
        socket.join(`clinic`)
        return
      }
      socket.join(`queue:${payload.doctorId}:${payload.date}`)
      socket.join(`clinic`)
    })
    socket.on('queue:unsubscribe', (payload: { doctorId: string; date: string }) => {
      if (payload?.doctorId && payload?.date) {
        socket.leave(`queue:${payload.doctorId}:${payload.date}`)
      }
    })
  })

  return io
}

export function emitQueueUpdated(doctorId: string, date: string) {
  io?.to(`queue:${doctorId}:${date}`).emit('queue:updated', { doctorId, date })
  io?.to('clinic').emit('clinic:updated', { doctorId, date })
  io?.emit('clinic:updated', { doctorId, date })
}

export function getIO() {
  return io
}
