// Protected one-time onboarding. Use the Neon DATABASE_URL only on your own machine.
import { neon } from '@neondatabase/serverless'
import { hashPassword,acceptedPassword } from '../lib/password.mjs'
const url=process.env.DATABASE_URL??''
if(!url.includes('.neon.tech')) { console.error('Configure DATABASE_URL do Neon exclusivo do Hub.');process.exit(1) }
// Deprecated for this installation: reserve users in SQL and use one-time activation links.
// This script remains for fresh private installations only.
const users=[
  {slot:'mateus',name:'Mateus',email:process.env.MATEUS_EMAIL?.trim().toLowerCase(),password:process.env.MATEUS_PASSWORD},
  {slot:'roberto',name:'Roberto',email:process.env.ROBERTO_EMAIL?.trim().toLowerCase(),password:process.env.ROBERTO_PASSWORD},
]
if(users.some(u=>!u.email||!/^\S+@\S+\.\S+$/.test(u.email)||u.email.length>254||!acceptedPassword(u.password))||users[0].email===users[1].email){
  console.error('Informe dois e-mails diferentes e senhas fortes (12 a 256 caracteres) em .env.local.');process.exit(1)
}
const sql=neon(url)
try {
  const existing=await sql`SELECT slot,email FROM hub_members`
  if (existing.some(x=>!users.some(u=>u.slot===x.slot && u.email===x.email)) || existing.length>2) throw Error('Banco contém membros diferentes. Nenhuma conta será alterada.')
  for(const user of users) {
    if(existing.some(x=>x.slot===user.slot)) {console.log(`${user.name}: já configurado; senha e perfil preservados.`);continue}
    const passwordHash=await hashPassword(user.password)
    const created=await sql`INSERT INTO hub_members (slot,name,email,password_hash)
      VALUES (${user.slot},${user.name},${user.email},${passwordHash}) ON CONFLICT DO NOTHING RETURNING id`
    if(created.length!==1) throw Error(`Conflito ao criar perfil ${user.slot}`)
    console.log(`${user.name}: conta privada criada.`)
  }
} catch (err) {console.error('Erro no provisionamento:',err.message);process.exitCode=1}
