import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'
import { HttpError } from '../lib/eta.js'

export type AuthUser = {
  id: string
  role: 'patient' | 'doctor' | 'admin'
  email: string
  name: string
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser
    }
  }
}

export function signToken(user: AuthUser) {
  return jwt.sign(user, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'] })
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new HttpError(401, 'Authentication required'))
  }
  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET) as AuthUser
    req.user = payload
    next()
  } catch {
    next(new HttpError(401, 'Invalid or expired token'))
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization
  if (header?.startsWith('Bearer ')) {
    try {
      req.user = jwt.verify(header.slice(7), env.JWT_SECRET) as AuthUser
    } catch {
      /* ignore */
    }
  }
  next()
}

export function requireRole(...roles: AuthUser['role'][]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) return next(new HttpError(401, 'Authentication required'))
    if (!roles.includes(req.user.role)) {
      return next(new HttpError(403, 'Insufficient permissions'))
    }
    next()
  }
}
