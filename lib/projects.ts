import 'server-only'
import { db } from './db'
import { requireMember } from './auth'
import { knownStatus } from './project-fields.mjs'

export type HubProject = {
  id:string; name:string; description:string|null;category:string|null;
  client_name:string|null; production_url:string|null; demo_url:string|null;
  repository_url:string|null;technology:string|null;status:string;
  started_on:string|null;due_on:string|null;responsible_id:string|null;
  responsible_name:string|null;notes:string|null;expected_revenue_cents:string|number;
  created_at:string
}
export type Owner = {id:string;name:string;slot:'mateus'|'roberto'}
export async function listOwners():Promise<Owner[]> {
  await requireMember()
  const sql=db()
  return (await sql`SELECT id,name,slot FROM hub_members ORDER BY slot`) as Owner[]
}
export function resolveProjectFilters(values:{q?:string;status?:string;page?:string}){
  const q=(typeof values.q==='string'?values.q:'').trim().slice(0,80)
  const status=knownStatus(values.status)?values.status!:'all'
  const numeric=Number(typeof values.page==='string'?values.page:1)
  const page=Number.isSafeInteger(numeric)&&numeric>=1?Math.min(numeric,1000):1
  return {q,status,page}
}
export async function listProjects(query:{q:string;status:string;page:number}){
  await requireMember()
  const sql=db()
  const {q,status,page}=query
  const offset=(page-1)*20
  const [rows,count]=await Promise.all([
    sql`SELECT p.id,p.name,p.description,p.category,p.client_name,p.production_url,p.demo_url,
      p.repository_url,p.technology,p.status,p.started_on::text AS started_on,
      p.due_on::text AS due_on,p.responsible_id,m.name AS responsible_name,
      p.notes,p.expected_revenue_cents,p.created_at::text AS created_at
      FROM hub_projects p LEFT JOIN hub_members m ON m.id=p.responsible_id
      WHERE (${status}='all' OR p.status=${status})
        AND (${q}='' OR position(lower(${q}) in lower(p.name))>0
             OR position(lower(${q}) in lower(coalesce(p.client_name,'')))>0)
      ORDER BY p.created_at DESC,p.id DESC LIMIT 20 OFFSET ${offset}`,
    sql`SELECT count(*)::integer AS total FROM hub_projects p
      WHERE (${status}='all' OR p.status=${status})
        AND (${q}='' OR position(lower(${q}) in lower(p.name))>0
             OR position(lower(${q}) in lower(coalesce(p.client_name,'')))>0)`
  ])
  return {rows:rows as HubProject[],total:Number(count[0]?.total??0),perPage:20}
}
export async function getProject(id:string):Promise<HubProject|null>{
  await requireMember()
  if(!/^[0-9a-fA-F-]{36}$/.test(id))return null
  const sql=db()
  const rows=await sql`SELECT p.id,p.name,p.description,p.category,p.client_name,
    p.production_url,p.demo_url,p.repository_url,p.technology,p.status,
    p.started_on::text AS started_on,p.due_on::text AS due_on,p.responsible_id,
    m.name AS responsible_name,p.notes,p.expected_revenue_cents,
    p.created_at::text AS created_at
    FROM hub_projects p LEFT JOIN hub_members m ON m.id=p.responsible_id WHERE p.id::text=${id} LIMIT 1`
  return (rows[0] as HubProject|undefined)??null
}
