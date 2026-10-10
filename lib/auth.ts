import 'server-only'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { db } from './db'
import { isHubConfigured } from './config'
import { sessionDigest, newSessionToken, checkPassword, hashPassword, emailDigest, acceptedPassword } from './password.mjs'

export type Member = {
  id: string; slot: 'mateus' | 'roberto'; name: string; email: string;
  title: string | null; bio: string | null; avatar_url: string | null;
  theme: 'dark' | 'light'; last_seen_at: string | null
}
const COOKIE = 'arceuz_hub_session'
const SESSION_SECONDS = 7 * 24 * 60 * 60

export async function optionalMember(): Promise<Member | null> {
  if (!isHubConfigured()) return null
  const token = (await cookies()).get(COOKIE)?.value
  if (!token || !/^[a-zA-Z0-9_-]{43}$/.test(token)) return null
  const sql = db()
  const rows = await sql`
    SELECT m.id,m.slot,m.name,m.email,m.title,m.bio,m.avatar_url,m.theme,m.last_seen_at
    FROM hub_sessions s JOIN hub_members m ON m.id=s.member_id
    WHERE s.token_digest=${sessionDigest(token)} AND s.expires_at > now() AND m.activated_at IS NOT NULL
    LIMIT 1
  `
  return (rows[0] as Member | undefined) ?? null
}

export async function requireMember(): Promise<Member> {
  if (!isHubConfigured()) redirect('/login')
  const member = await optionalMember()
  if (!member) redirect('/login')
  return member
}

function cookieOptions() {
  return { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax' as const,
    path: '/', maxAge: SESSION_SECONDS, priority:'high' as const }
}
export async function authenticate(email: string, password: string) {
  if (!isHubConfigured()) return { ok: false, unavailable: true }
  const normalized = email.toLowerCase().trim()
  if (!/^\S+@\S+\.\S+$/.test(normalized) || normalized.length > 254 ||
      typeof password !== 'string' || password.length > 256 || !password) return { ok: false }
  const sql = db()
  const identity = emailDigest(normalized, process.env.AUTH_SECRET!)
  // Persistent rate limit: 6 invalid credentials per account / 15-minute window.
  const guards = await sql`SELECT attempts, window_started, locked_until FROM hub_login_guards WHERE email_digest=${identity}`
  if (guards[0]?.locked_until && new Date(guards[0].locked_until).getTime() > Date.now()) return { ok: false }
  const users = await sql`SELECT id,password_hash FROM hub_members WHERE lower(email)=${normalized} AND activated_at IS NOT NULL LIMIT 1`
  const verified = users[0] && typeof users[0].password_hash === 'string' ? await checkPassword(password, users[0].password_hash) : false
  if (!verified) {
    await sql`
      INSERT INTO hub_login_guards(email_digest,attempts,window_started,locked_until)
      VALUES(${identity},1,now(),null)
      ON CONFLICT (email_digest) DO UPDATE SET
        attempts = CASE WHEN hub_login_guards.window_started < now()-interval '15 minutes' THEN 1 ELSE hub_login_guards.attempts+1 END,
        window_started = CASE WHEN hub_login_guards.window_started < now()-interval '15 minutes' THEN now() ELSE hub_login_guards.window_started END,
        locked_until = CASE WHEN hub_login_guards.window_started < now()-interval '15 minutes' THEN null
          WHEN hub_login_guards.attempts+1 >= 6 THEN now()+interval '15 minutes'
          ELSE hub_login_guards.locked_until END
    `
    return { ok: false }
  }
  const token = newSessionToken()
  await sql`INSERT INTO hub_sessions(member_id,token_digest,expires_at)
    VALUES(${users[0].id},${sessionDigest(token)},now()+interval '7 days')`
  await sql`UPDATE hub_members SET last_seen_at=now() WHERE id=${users[0].id}`
  await sql`DELETE FROM hub_login_guards WHERE email_digest=${identity}`
  ;(await cookies()).set(COOKIE,token,cookieOptions())
  return { ok: true }
}

export async function endSession() {
  const store = await cookies()
  const token = store.get(COOKIE)?.value
  if (token && isHubConfigured()) {
    const sql = db()
    await sql`DELETE FROM hub_sessions WHERE token_digest=${sessionDigest(token)}`
  }
  store.delete(COOKIE)
}

export async function updateMemberProfile(member: Member, changes: {name:string,title:string,bio:string,avatar_url:string|null,theme:'light'|'dark'}) {
  const sql = db()
  const result = await sql`UPDATE hub_members SET name=${changes.name},title=${changes.title},bio=${changes.bio},
    avatar_url=${changes.avatar_url},theme=${changes.theme} WHERE id=${member.id} RETURNING id`
  return result.length === 1
}

export async function updateMemberPassword(member: Member, oldPassword: string, newPassword: string) {
  if (!acceptedPassword(newPassword)) return false
  const sql=db()
  const result = await sql`SELECT password_hash FROM hub_members WHERE id=${member.id}`
  if (!result.length || !await checkPassword(oldPassword,result[0].password_hash)) return false
  const hashed = await hashPassword(newPassword)
  const updated = await sql`UPDATE hub_members SET password_hash=${hashed} WHERE id=${member.id} AND password_hash=${result[0].password_hash} RETURNING id`
  if (!updated.length) return false
  // Changing a password revokes all other browser sessions immediately.
  const currentToken=(await cookies()).get(COOKIE)?.value
  await sql`DELETE FROM hub_sessions WHERE member_id=${member.id} AND token_digest<>${sessionDigest(currentToken??'')}`
  return true
}
