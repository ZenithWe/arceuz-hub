import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'
const read=name=>readFileSync(new URL('../'+name,import.meta.url),'utf8')
test('schema is independent of Supabase and uses restricted fixed slots',()=>{
  const sql=read('db/001_foundation.sql')
  for(const name of ['hub_members','hub_sessions','hub_login_guards','hub_projects','hub_repositories','hub_financial_entries','hub_tasks'])
    assert.match(sql,new RegExp(`CREATE TABLE IF NOT EXISTS ${name} \\(`))
  assert.match(sql,/slot IN \('mateus','roberto'\)/)
  assert.doesNotMatch(sql,/auth\.users|auth\.uid\(\)|SUPABASE/i)
})
test('no public registration; db access confined to server',()=>{
  assert.equal(existsSync(new URL('../app/signup',import.meta.url)),false)
  assert.equal(existsSync(new URL('../app/register',import.meta.url)),false)
  assert.doesNotMatch(read('lib/db.ts'),/NEXT_PUBLIC_DATABASE/)
  assert.match(read('lib/auth.ts'),/httpOnly:\s*true/)
  assert.match(read('lib/auth.ts'),/sameSite:\s*'lax'/)
  assert.match(read('lib/auth.ts'),/expires_at > now\(\)/)
  assert.match(read('app/(private)/layout.tsx'),/await requireMember\(\)/)
  assert.match(read('lib/dashboard.ts'),/await requireMember\(\)/)
})
test('migrations and account setup cannot target old Supabase projects',()=>{
  for(const p of ['scripts/provision-users.mjs','scripts/migrate.mjs','scripts/verify-setup.mjs']){
    assert.match(read(p),/\.neon\.tech/)
    assert.doesNotMatch(read(p),/SUPABASE_SECRET_KEY|NEXT_PUBLIC_SUPABASE/)
  }
})
test('login restricts repeated failures; sign out deletes server session',()=>{
  const auth=read('lib/auth.ts')
  assert.match(auth,/hub_login_guards/)
  assert.match(auth,/attempts\+1 >= 6/)
  assert.match(auth,/DELETE FROM hub_sessions WHERE token_digest=/)
  assert.match(auth,/UPDATE hub_members SET password_hash=/)
})
test('all required routes are present',()=>{
  for(const name of ['dashboard','settings','projects','github','financeiro','clientes','tarefas','ai'])
    assert.ok(existsSync(new URL(`../app/(private)/${name}/page.tsx`,import.meta.url)))
})
test('no Supabase dependency or previous auth adapter remains',()=>{
  const packageData=JSON.parse(read('package.json'))
  assert.ok(packageData.dependencies['@neondatabase/serverless'])
  assert.equal(packageData.dependencies['@supabase/supabase-js'],undefined)
  assert.equal(existsSync(new URL('../lib/supabase/server.ts',import.meta.url)),false)
  assert.ok(!readdirSync(new URL('../lib/',import.meta.url)).includes('supabase'))
})
test('Fase 2 projects are protected, paginated, and preserve archives',()=>{
  const list=read('lib/projects.ts')
  const actions=read('app/(private)/projects/actions.ts')
  assert.match(list,/await requireMember\(\)/)
  assert.match(list,/LIMIT 20 OFFSET/)
  assert.match(actions,/await requireMember\(\)/)
  assert.match(actions,/UPDATE hub_projects SET status='archived'/)
  assert.doesNotMatch(actions,/DELETE FROM hub_projects/)
  assert.match(actions,/normalizeProjectURL/)
  assert.match(actions,/parseBRLCents/)
})
test('preview deployment config never commits secrets',()=>{
  const yaml=read('render.yaml')
  assert.match(yaml,/plan: free/)
  assert.match(yaml,/generateValue: true/)
  assert.match(yaml,/DATABASE_URL\s*\n\s*sync: false/)
  assert.doesNotMatch(yaml,/postgresql:\/\//)
  assert.match(read('next.config.ts'),/X-Robots-Tag/)
})
