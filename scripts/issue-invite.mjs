// Run only by the app administrator, from a private terminal, AFTER the public HTTPS URL exists.
// Send each one-time URL only to that member's independently confirmed email.
import { neon } from '@neondatabase/serverless'
import { newSessionToken, sessionDigest } from '../lib/password.mjs'
const slot=process.argv[2]
const site=(process.env.HUB_BASE_URL??'').replace(/\/$/,'')
if (!['mateus','roberto'].includes(slot) || !/^https:\/\/[^/]+$/.test(site)) {
  console.error('Configure HUB_BASE_URL=https://your-host e execute npm run invite -- mateus|roberto.')
  process.exit(1)
}
const conn=process.env.DATABASE_URL??''
if(!conn.includes('.neon.tech')) {console.error('DATABASE_URL Neon ausente.');process.exit(1)}
const sql=neon(conn)
const rows=await sql`SELECT id,email,activated_at FROM hub_members WHERE slot=${slot}`
if(rows.length!==1) throw Error('Conta ainda não reservada no Neon.')
if(rows[0].activated_at !== null) throw Error('Conta já está ativa. Não é necessário emitir convite.')
const token=newSessionToken()
const digest=sessionDigest(token)
await sql`INSERT INTO hub_activation_tokens(token_digest,member_id,expires_at) VALUES(${digest},${rows[0].id},now()+interval '24 hours')`
// Treat this as a password reset URL: do not publish it or send it to anyone but the account owner.
console.log(`Destinatário: ${rows[0].email}`)
console.log(`Convite de uso único: ${site}/ativar?token=${token}`)
console.log('Expira em 24h. Envie exclusivamente ao e-mail acima. Não armazene o link em sistemas públicos.')
