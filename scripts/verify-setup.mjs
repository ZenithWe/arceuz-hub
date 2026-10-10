// Non-mutating environment check. Never prints credentials or passwords.
import { neon } from '@neondatabase/serverless'
const url=process.env.DATABASE_URL??''
const secret=process.env.AUTH_SECRET??''
if(!url.includes('.neon.tech')||secret.length<32){console.error('Configure DATABASE_URL Neon e AUTH_SECRET com pelo menos 32 caracteres.');process.exit(1)}
const sql=neon(url)
try{
  const members=await sql`SELECT slot,email FROM hub_members ORDER BY slot`
  if(members.length!==2||members.map(m=>m.slot).sort().join(',')!=='mateus,roberto')throw Error('Faltam as duas contas ou há usuários inesperados.')
  const objects=await sql`SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename LIKE 'hub_%'`
  for(const t of ['hub_projects','hub_repositories','hub_financial_entries','hub_tasks','hub_sessions','hub_login_guards','hub_activation_tokens']){
    if(!objects.some(x=>x.tablename===t))throw Error(`Tabela ausente: ${t}`)
  }
  const result=await sql`SELECT count(*)::integer AS total FROM hub_projects`
  console.log(`Neon conectado; duas contas reservadas/autorizadas; schema válido; projetos cadastrados: ${result[0].total}.`)
} catch(e){console.error('Não foi possível validar ambiente:',e.message);process.exitCode=1}
