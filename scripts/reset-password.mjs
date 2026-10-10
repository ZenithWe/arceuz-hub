// Local-only administrative password reset. Does not require an email provider.
import { neon } from '@neondatabase/serverless'
import { hashPassword,acceptedPassword } from '../lib/password.mjs'
const slot=process.argv[2]
if(!['mateus','roberto'].includes(slot)) {console.error('Uso: npm run reset:password -- mateus|roberto');process.exit(1)}
const url=process.env.DATABASE_URL??''
const pwd=slot==='mateus'?process.env.MATEUS_PASSWORD:process.env.ROBERTO_PASSWORD
if(!url.includes('.neon.tech')||!acceptedPassword(pwd)){console.error('Configure DATABASE_URL e a nova senha (12-256 chars) correspondente em .env.local.');process.exit(1)}
const sql=neon(url)
const hashed=await hashPassword(pwd)
try {
  const rows=await sql`UPDATE hub_members SET password_hash=${hashed} WHERE slot=${slot} RETURNING id`
  if(rows.length!==1) throw Error('Usuário não encontrado')
  await sql`DELETE FROM hub_sessions WHERE member_id=${rows[0].id}`
  console.log(`Senha redefinida para ${slot}. Todas as sessões foram encerradas.`)
} catch(e) {console.error('Não foi possível redefinir a senha:',e.message);process.exitCode=1}
