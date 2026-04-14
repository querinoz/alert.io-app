import type { MiddlewareHandler, Context } from 'hono'
import { firebaseAuth } from '../lib/firebase'

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const header = c.req.header('Authorization')
  if (!header?.startsWith('Bearer ')) {
    return c.json({ error: 'Token não fornecido' }, 401)
  }
  try {
    const decoded = await firebaseAuth.verifyIdToken(header.slice(7))
    c.set('userId', decoded.uid)
    c.set('email', decoded.email ?? '')
    await next()
  } catch {
    return c.json({ error: 'Token inválido' }, 401)
  }
}

export function getUserId(c: Context): string {
  return c.get('userId')
}

export function getUserEmail(c: Context): string {
  return c.get('email')
}
