import 'server-only'
import { neon } from '@neondatabase/serverless'

// Only called on the server. Never prefix DATABASE_URL with NEXT_PUBLIC_.
export function isDatabaseConfigured() {
  const value = process.env.DATABASE_URL ?? ''
  try {
    const url = new URL(value)
    return ['postgresql:', 'postgres:'].includes(url.protocol) &&
      url.hostname.endsWith('.neon.tech') && Boolean(url.username) && Boolean(url.password)
  } catch { return false }
}

export function db() {
  if (!isDatabaseConfigured()) throw new Error('Banco do Arceuz Hub não configurado')
  return neon(process.env.DATABASE_URL!, { fullResults: false })
}
