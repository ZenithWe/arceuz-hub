import 'server-only'
import { db } from './db'
import { requireMember } from './auth'
import { normalizeRepositoryProject } from './repository-fields.mjs'
export type RepositoryRow={id:string;github_full_name:string;html_url:string;
 project_id:string|null;project_name:string|null;description:string;
 language:string|null;default_branch:string|null;stars:number;
 visibility:string;sync_status:string;last_synced_at:string|null;
 last_commit_at:string|null;updated_at:string|null;created_at:string}
export type LinkedProject={id:string;name:string}
export function resolveRepositoryFilters(raw:{q?:string;sync?:string;page?:string}){
 const q=(raw.q??'').trim().slice(0,80)
 const sync=['never','ok','unavailable'].includes(raw.sync??'')?raw.sync!:'all'
 const n=Number(raw.page??1)
 const page=Number.isSafeInteger(n)&&n>0?Math.min(n,1000):1
 return {q,sync,page}
}
export async function linkedProjects(){
 await requireMember()
 const sql=db()
 return (await sql`SELECT id,name FROM hub_projects WHERE status<>'archived' ORDER BY name LIMIT 300`) as LinkedProject[]
}
export async function validLinkedProject(id:string|null){
 if(!id)return true
 if(!normalizeRepositoryProject(id).value)return false
 const sql=db()
 const rows=await sql`SELECT id FROM hub_projects WHERE id::text=${id} LIMIT 1`
 return rows.length===1
}
export async function listRepositories({q,sync,page}:ReturnType<typeof resolveRepositoryFilters>){
 await requireMember()
 const sql=db(),offset=(page-1)*18
 const [rows,counts]=await Promise.all([
  sql`SELECT r.id,r.github_full_name,r.html_url,r.project_id,p.name AS project_name,
   r.description,r.language,r.default_branch,r.stars,r.visibility,r.sync_status,
   r.last_synced_at::text AS last_synced_at,r.last_commit_at::text AS last_commit_at,
   r.updated_at::text AS updated_at,r.created_at::text AS created_at
   FROM hub_repositories r LEFT JOIN hub_projects p ON p.id=r.project_id
   WHERE (${sync}='all' OR r.sync_status=${sync}) AND
   (${q}='' OR position(lower(${q}) in lower(r.github_full_name))>0
    OR position(lower(${q}) in lower(coalesce(p.name,'')))>0)
   ORDER BY r.created_at DESC,r.id DESC LIMIT 18 OFFSET ${offset}`,
  sql`SELECT count(*)::integer AS total FROM hub_repositories r LEFT JOIN hub_projects p ON p.id=r.project_id
   WHERE (${sync}='all' OR r.sync_status=${sync}) AND
   (${q}='' OR position(lower(${q}) in lower(r.github_full_name))>0
    OR position(lower(${q}) in lower(coalesce(p.name,'')))>0)`
 ])
 return {rows:rows as RepositoryRow[],total:Number(counts[0]?.total??0),perPage:18}
}
export async function getRepository(id:string):Promise<RepositoryRow|null>{
 await requireMember()
 if(!normalizeRepositoryProject(id).value)return null
 const sql=db()
 const rows=await sql`SELECT r.id,r.github_full_name,r.html_url,r.project_id,p.name AS project_name,
  r.description,r.language,r.default_branch,r.stars,r.visibility,r.sync_status,
  r.last_synced_at::text AS last_synced_at,r.last_commit_at::text AS last_commit_at,
  r.updated_at::text AS updated_at,r.created_at::text AS created_at
  FROM hub_repositories r LEFT JOIN hub_projects p ON p.id=r.project_id WHERE r.id::text=${id} LIMIT 1`
 return rows.length?(rows[0] as RepositoryRow):null
}
