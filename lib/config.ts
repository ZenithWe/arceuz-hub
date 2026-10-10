import { isDatabaseConfigured } from './db'
export function isHubConfigured() {
  return isDatabaseConfigured() && Boolean(process.env.AUTH_SECRET && process.env.AUTH_SECRET.length >= 32)
}
