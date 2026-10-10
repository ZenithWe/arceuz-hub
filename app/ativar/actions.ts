'use server'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { acceptedPassword, hashPassword, sessionDigest } from '@/lib/password.mjs'
import { isHubConfigured } from '@/lib/config'

export type ActivationState = { error: string }

export async function activateAccount(_prev: ActivationState, data: FormData): Promise<ActivationState> {
  const token = String(data.get('token') ?? '')
  const password = String(data.get('password') ?? '')
  const confirmation = String(data.get('confirmation') ?? '')
  if (!isHubConfigured()) return {error: 'O serviço ainda não está disponível.'}
  if (!/^[A-Za-z0-9_-]{43}$/.test(token)) return {error: 'Convite inválido ou expirado.'}
  if (!acceptedPassword(password)) return {error: 'A senha deve conter entre 12 e 256 caracteres.'}
  if (password !== confirmation) return {error: 'As senhas informadas são diferentes.'}
  try {
    const sql = db()
    const passwordHash = await hashPassword(password)
    // A single SQL statement consumes the invitation and activates its account atomically.
    // The token is never stored as plaintext and a second attempt cannot change the password.
    const rows = await sql`
      WITH consumed AS (
        UPDATE hub_activation_tokens
        SET used_at=now()
        WHERE token_digest=${sessionDigest(token)}
          AND used_at IS NULL AND expires_at > now()
        RETURNING member_id
      )
      UPDATE hub_members AS m
      SET password_hash=${passwordHash},activated_at=now()
      WHERE m.id=(SELECT member_id FROM consumed LIMIT 1)
        AND m.activated_at IS NULL AND m.password_hash IS NULL
      RETURNING m.id
    `
    if (!rows.length) return {error: 'Convite inválido, usado ou expirado.'}
    // If the member previously had any sessions, invalidate them defensively.
    await sql`DELETE FROM hub_sessions WHERE member_id=${rows[0].id}`
  } catch {
    return {error: 'Não foi possível ativar sua conta agora. Tente novamente.'}
  }
  redirect('/login?ativado=1')
}
