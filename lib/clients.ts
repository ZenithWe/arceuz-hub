import 'server-only'
import { requireMember } from './auth'
import { db } from './db'
import { knownClientStatus } from './client-fields.mjs'

export type ClientRow={
 id:string;name:string;contact_name:string;email:string;phone:string;whatsapp:string;
 website:string|null;status:string;notes:string;created_at:string;updated_at:string;
 project_count:number
}
export type ClientProject={id:string;name:string;status:string;client_id?:string|null}
export function resolveClientFilters(values:{q?:string;status?:string;page?:string}) {
 const q=typeof values.q==='string'?values.q.trim().slice(0,80):''
 const status=knownClientStatus(values.status)?values.status!:'all'
 const n=Number(values.page??1)
 const page=Number.isSafeInteger(n)&&n>=1?Math.min(n,1000):1
 return {q,status,page}
}
export async function listClients({q,status,page}:ReturnType<typeof resolveClientFilters>){
 await requireMember()
 const sql=db(),offset=(page-1)*15
 const [rows,total]=await Promise.all([
 sql`SELECT c.id,c.name,c.contact_name,c.email,c.phone,c.whatsapp,c.website,c.status,c.notes,
 c.created_at::text AS created_at,c.updated_at::text AS updated_at,
 (SELECT count(*)::integer FROM hub_projects p WHERE p.client_id=c.id) AS project_count
 FROM hub_clients c
 WHERE (${status}='all' OR c.status=${status}) AND
 (${q}='' OR position(lower(${q}) in lower(c.name))>0 OR
 position(lower(${q}) in lower(c.contact_name))>0 OR
 position(lower(${q}) in lower(c.email))>0)
 ORDER BY c.created_at DESC,c.id DESC LIMIT 15 OFFSET ${offset}`,
 sql`SELECT count(*)::integer AS total FROM hub_clients c
 WHERE (${status}='all' OR c.status=${status}) AND
 (${q}='' OR position(lower(${q}) in lower(c.name))>0 OR
 position(lower(${q}) in lower(c.contact_name))>0 OR
 position(lower(${q}) in lower(c.email))>0)`
 ])
 return {rows:rows as ClientRow[],total:Number(total[0]?.total??0),perPage:15}
}
export async function getClient(id:string):Promise<ClientRow|null> {
 await requireMember()
 if(!/^[0-9a-f-]{36}$/i.test(id))return null
 const sql=db()
 const rows=await sql`SELECT c.id,c.name,c.contact_name,c.email,c.phone,c.whatsapp,c.website,c.status,c.notes,
 c.created_at::text AS created_at,c.updated_at::text AS updated_at,
 (SELECT count(*)::integer FROM hub_projects p WHERE p.client_id=c.id) AS project_count
 FROM hub_clients c WHERE c.id::text=${id} LIMIT 1`
 return (rows[0] as ClientRow|undefined)??null
}
export async function listClientProjects(id:string){
 await requireMember()
 const sql=db()
 const [attached,available]=await Promise.all([
 sql`SELECT id,name,status FROM hub_projects WHERE client_id::text=${id}
 ORDER BY created_at DESC LIMIT 100`,
 sql`SELECT id,name,status FROM hub_projects WHERE client_id IS NULL
 ORDER BY created_at DESC LIMIT 100`
 ])
 return {attached:attached as ClientProject[],available:available as ClientProject[]}
}
