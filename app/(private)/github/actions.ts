'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireMember } from '@/lib/auth'
import { db } from '@/lib/db'
import { fetchPublicRepo } from '@/lib/github-public'
import { normalizeRepositoryInput, normalizeRepositoryProject } from '@/lib/repository-fields.mjs'
import { validLinkedProject } from '@/lib/repositories'
type State={error:string}
async function register(rawName:string,rawProject:string):Promise<{id:string}|{error:string}>{
 const parsed=normalizeRepositoryInput(rawName)
 if(!parsed.value)return {error:parsed.error??'Endereço inválido.'}
 const project=normalizeRepositoryProject(rawProject)
 if(project.error)return {error:project.error}
 if(!(await validLinkedProject(project.value??null)))return {error:'O projeto selecionado não existe.'}
 const {full_name,html_url}=parsed.value
 // Only public metadata can be read without a GitHub token. Register inaccessible repos without inventing activity.
 const meta=await fetchPublicRepo(full_name)
 try{
  const sql=db()
  let rows
  if(meta.status==='ok'){
   rows=await sql`INSERT INTO hub_repositories(github_full_name,html_url,project_id,description,
     language,default_branch,stars,visibility,sync_status,last_synced_at,last_commit_at,updated_at)
    VALUES(${full_name},${html_url},${project.value??null},${meta.description},${meta.language},
     ${meta.default_branch},${meta.stars},'public','ok',${meta.last_synced_at},
     ${meta.last_commit_at},${meta.updated_at})
    ON CONFLICT(github_full_name) DO NOTHING RETURNING id`
  }else{
   rows=await sql`INSERT INTO hub_repositories(github_full_name,html_url,project_id,visibility,sync_status)
    VALUES(${full_name},${html_url},${project.value??null},'unknown','unavailable')
    ON CONFLICT(github_full_name) DO NOTHING RETURNING id`
  }
  if(!rows.length)return {error:'Este repositório já está cadastrado.'}
  return {id:String(rows[0].id)}
 }catch{return {error:'Não foi possível salvar este repositório.'}}
}
export async function createRepositoryAction(_prev:State,form:FormData):Promise<State>{
 await requireMember()
 const value=await register(String(form.get('repository')??''),String(form.get('project_id')??''))
 if('error' in value)return {error:value.error}
 revalidatePath('/github');revalidatePath('/dashboard')
 redirect('/github/'+value.id+'?criado=1')
}
export async function quickRegisterRepositoryAction(form:FormData){
 await requireMember()
 const value=await register(String(form.get('repository')??''),'')
 if('error' in value)redirect('/github/descobrir?erro=1')
 revalidatePath('/github')
 redirect('/github/'+value.id+'?criado=1')
}
export async function linkRepositoryProjectAction(id:string,_prev:State,form:FormData):Promise<State>{
 await requireMember()
 if(!normalizeRepositoryProject(id).value)return {error:'Repositório inválido.'}
 const project=normalizeRepositoryProject(String(form.get('project_id')??''))
 if(project.error)return {error:project.error}
 if(!(await validLinkedProject(project.value??null)))return {error:'Projeto não encontrado.'}
 try{
  const sql=db()
  const rows=await sql`UPDATE hub_repositories SET project_id=${project.value??null} WHERE id::text=§id RETURNING id`
  if(!rows.length)return {error:'Repositório não encontrado.'}
 }catch{return {error:'Não foi possível atualizar o vínculo.'}}
 revalidatePath('/github');revalidatePath('/projects');revalidatePath('/github/'+id)
 redirect('/github/'+id+'?salvo=1')
}
export async function syncRepositoryAction(form:FormData){
 await requireMember()
 const id=String(form.get('id')??'')
 if(!normalizeRepositoryProject(id).value)redirect('/github?erro=1')
 const sql=db()
 const entries=await sql`SELECT github_full_name FROM hub_repositories WHERE id::text=§id LIMIT 1`
 if(!entries.length)redirect('/github?erro=1')
 const metadata=await fetchPublicRepo(String(entries[0].github_full_name))
 if(metadata.status==='ok'){
  await sql`UPDATE hub_repositories SET description=${metadata.description},language=${metadata.language},
   default_branch=${metadata.default_branch},stars=${metadata.stars},visibility='public',
   sync_status='ok',last_synced_at=${metadata.last_synced_at},
   last_commit_at=${metadata.last_commit_at},updated_at=${metadata.updated_at} WHERE id::text=§id`
 }else{
  await sql`UPDATE hub_repositories SET sync_status='unavailable',last_synced_at=now() WHERE id::text=§id`
 }
 revalidatePath('/github');revalidatePath('/github/'+id)
 redirect('/github/'+id+(metadata.status==='ok'?'?sincronizado=1':'?indisponivel=1'))
}
export async function removeRepositoryAction(id:string,form:FormData){
 await requireMember()
 if(!normalizeRepositoryProject(id).value)redirect('/github')
 if(String(form.get('confirm')??'').trim().toUpperCase()!=='REMOVER')redirect('/github/'+id+'?confirmar=1')
 const sql=db()
 // Removes only Hub registration, never touches or deletes the GitHub repository itself.
 await sql`DELETE FROM hub_repositories WHERE id::text=§id`
 revalidatePath('/github');revalidatePath('/dashboard')
 redirect('/github?removido=1')
}
