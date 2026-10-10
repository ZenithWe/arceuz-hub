'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireMember } from '@/lib/auth'
import { db } from '@/lib/db'
import { recordActivity } from '@/lib/activity-write'
import { knownStatus,normalizeProjectURL,parseBRLCents,validISODate } from '@/lib/project-fields.mjs'

type State={error:string}
class ProjectValidationError extends Error {}
function invalid(message:string):never { throw new ProjectValidationError(message) }
function parseInput(form:FormData) {
  const text=(key:string)=>String(form.get(key)??'').trim()
  const name=text('name'),description=text('description'),client_name=text('client_name')
  const category=text('category'),technology=text('technology'),notes=text('notes')
  const status=text('status'),owner=text('responsible_id')
  const started_on=text('started_on'),due_on=text('due_on')
  const expected_revenue_cents=parseBRLCents(text('expected_revenue'))
  const production_url=normalizeProjectURL(text('production_url'))
  const demo_url=normalizeProjectURL(text('demo_url'))
  const repository_url=normalizeProjectURL(text('repository_url'))
  if(name.length<2||name.length>110)invalid('Informe um nome de 2 a 110 caracteres.')
  if(description.length>2000||notes.length>5000)invalid('Descrição ou anotações muito extensas.')
  if(client_name.length>160||category.length>100||technology.length>160)invalid('Confira o tamanho dos campos.')
  if(!knownStatus(status))invalid('Status inválido.')
  if([production_url,demo_url,repository_url].some(x=>x===null))invalid('Os links devem começar com https:// e não conter credenciais.')
  if(!validISODate(started_on)||!validISODate(due_on)||(started_on&&due_on&&due_on<started_on))invalid('Confira as datas do projeto.')
  if(expected_revenue_cents===null)invalid('Valor previsto inválido. Exemplo: 1.999,90.')
  if(owner&&!/^[0-9a-f-]{36}$/i.test(owner))invalid('Responsável inválido.')
  return {name,description,client_name,category,technology,notes,status,owner,
    started_on:started_on||null,due_on:due_on||null,expected_revenue_cents,
    production_url:production_url||null,demo_url:demo_url||null,repository_url:repository_url||null}
}
async function ensureOwner(owner:string) {
  if(!owner)return null
  const sql=db()
  const rows=await sql`SELECT id FROM hub_members WHERE id::text=${owner} LIMIT 1`
  if(rows.length!==1)invalid('Responsável não pertence à equipe.')
  return owner
}
export async function createProjectAction(_prev:State,form:FormData):Promise<State>{
  const member=await requireMember()
  let id:string
  try {
    const data=parseInput(form)
    const owner=await ensureOwner(data.owner)
    const sql=db()
    const rows=await sql`INSERT INTO hub_projects(name,description,category,client_name,production_url,
      demo_url,repository_url,technology,status,started_on,due_on,responsible_id,notes,
      expected_revenue_cents)
      VALUES(${data.name},${data.description},${data.category},${data.client_name},${data.production_url},
        ${data.demo_url},${data.repository_url},${data.technology},${data.status},${data.started_on},
        ${data.due_on},${owner},${data.notes},${data.expected_revenue_cents}) RETURNING id`
    id=String(rows[0].id)
  } catch(e) {
    return {error:e instanceof ProjectValidationError?e.message:'Não foi possível salvar o projeto.'}
  }
  await recordActivity(member.id,'project_created','project',id,String(form.get('name')??''))
  revalidatePath('/projects');revalidatePath('/dashboard')
  redirect(`/projects/${id}?criado=1`)
}
export async function editProjectAction(id:string,_prev:State,form:FormData):Promise<State>{
  const member=await requireMember()
  if(!/^[0-9a-f-]{36}$/i.test(id))return {error:'Projeto inválido.'}
  try {
    const data=parseInput(form)
    const owner=await ensureOwner(data.owner)
    const sql=db()
    const result=await sql`UPDATE hub_projects SET
      name=${data.name},description=${data.description},category=${data.category},
      client_name=${data.client_name},production_url=${data.production_url},demo_url=${data.demo_url},
      repository_url=${data.repository_url},technology=${data.technology},status=${data.status},
      started_on=${data.started_on},due_on=${data.due_on},responsible_id=${owner},notes=${data.notes},
      expected_revenue_cents=${data.expected_revenue_cents}
      WHERE id::text=${id} RETURNING id`
    if(!result.length)return {error:'Projeto não encontrado.'}
  } catch(e) {return {error:e instanceof ProjectValidationError?e.message:'Não foi possível salvar o projeto.'}}
  await recordActivity(member.id,'project_updated','project',id,String(form.get('name')??''))
  revalidatePath('/projects');revalidatePath(`/projects/${id}`);revalidatePath('/dashboard')
  redirect(`/projects/${id}?salvo=1`)
}
export async function archiveProjectAction(form:FormData) {
  const member=await requireMember()
  const id=String(form.get('id')??'')
  if(!/^[0-9a-f-]{36}$/i.test(id))redirect('/projects')
  const sql=db()
  const rows=await sql`UPDATE hub_projects SET status='archived' WHERE id::text=${id} RETURNING name`
  if(rows[0]) await recordActivity(member.id,'project_archived','project',id,String(rows[0].name))
  revalidatePath('/projects');revalidatePath('/dashboard');revalidatePath(`/projects/${id}`)
  redirect('/projects?status=archived')
}
