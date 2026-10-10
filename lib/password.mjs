import { randomBytes, scrypt as scryptCallback, timingSafeEqual, createHash, createHmac } from 'node:crypto'
import { promisify } from 'node:util'
const scrypt = promisify(scryptCallback)
const options = { N: 1 << 15, r: 8, p: 1, maxmem: 64 * 1024 * 1024 }
const cost = 64
export function acceptedPassword(password) {
  return typeof password === 'string' && password.length >= 12 && password.length <= 256
}
export async function hashPassword(password) {
  if (!acceptedPassword(password)) throw new Error('Senha deve ter entre 12 e 256 caracteres')
  const salt = randomBytes(24)
  const derived = await scrypt(password, salt, cost, options)
  return `scrypt-v1:${salt.toString('base64url')}:${derived.toString('base64url')}`
}
export async function checkPassword(password, stored) {
  if (typeof password !== 'string' || password.length > 256 || typeof stored !== 'string') return false
  const parts = stored.split(':')
  if (parts.length !== 3 || parts[0] !== 'scrypt-v1') return false
  const salt = Buffer.from(parts[1], 'base64url')
  const expected = Buffer.from(parts[2], 'base64url')
  if (salt.length !== 24 || expected.length !== cost) return false
  const actual = await scrypt(password, salt, cost, options)
  return timingSafeEqual(expected, actual)
}
export function newSessionToken() { return randomBytes(32).toString('base64url') }
export function sessionDigest(token) { return createHash('sha256').update(token).digest('hex') }
export function emailDigest(email, secret) { return createHmac('sha256', secret).update(email).digest('hex') }
