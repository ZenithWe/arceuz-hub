// Apply only to a NEW Arceuz Hub Neon database. No existing project is touched.
import { neon } from '@neondatabase/serverless'
import { readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
const url=process.env.DATABASE_URL??''
if (!url.includes('.neon.tech')) { console.error('DATABASE_URL precisa ser do Neon dedicado ao Hub.');process.exit(1) }
const sql=neon(url)
const ddl=await readFile(new URL('../db/001_foundation.sql',import.meta.url),'utf8')
const sha=createHash('sha256').update(ddl).digest('hex')
// No procedural bodies, string literals containing semicolons, or multiline triggers in these migrations.
const statements=ddl.split(';').map(x=>x.trim()).filter(x=>x && !x.startsWith('-- No client-side'))
try {
  await sql`CREATE TABLE IF NOT EXISTS hub_schema_migrations (name text PRIMARY KEY, sha256 text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`
  const old=await sql`SELECT sha256 FROM hub_schema_migrations WHERE name='001_foundation'`
  if(old.length) {
    if(old[0].sha256!==sha) throw new Error('O arquivo 001 mudou depois de aplicado; crie uma nova migration.')
    console.log('Migração 001 já aplicada e checksum confirmado.')
  }
  if (!old.length) for(const statement of statements) {
    const cleaned=statement.split('\n').filter(line=>!line.trim().startsWith('--')).join('\n').trim()
    if(cleaned) await sql.query(cleaned)
  }
  if(!old.length) await sql`INSERT INTO hub_schema_migrations (name,sha256) VALUES ('001_foundation',${sha})`
  const inviteDdl=await readFile(new URL('../db/002_invitation.sql',import.meta.url),'utf8')
  const inviteSha=createHash('sha256').update(inviteDdl).digest('hex')
  const existing=await sql`SELECT sha256 FROM hub_schema_migrations WHERE name='002_invitation'`
  if(existing.length && existing[0].sha256!==inviteSha) throw Error('A migração 002 diverge do código.')
  if(!existing.length) {
    for(const st of inviteDdl.split(';')){
      const clean=st.split('\n').filter(l=>!l.trim().startsWith('--')).join('\n').trim()
      if(clean) await sql.query(clean)
    }
    await sql`INSERT INTO hub_schema_migrations(name,sha256) VALUES('002_invitation',${inviteSha})`
  }
  console.log('Migrações 001 e 002 verificadas.');
} catch(err) { console.error('Falha ao executar migração:',err.message); process.exitCode=1 }
