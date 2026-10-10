import 'server-only'
import { requireMember } from './auth'
import { db } from './db'
import { knownTaskPriority,knownTaskStatus,isUuid } from './task-fields.mjs'
export type HubTask={id:string;title:string;description:string|null;status:string;priority:string;due_on:string|null;assigned_to:string|null;assigned_name:string|null;project_id:string|null;project_name:string|null;created_at:string;updated_at:string;completed_at:string|null}
export type TaskMember={id:string;name:string;slot:'mateus'|'roberto'}
export type TaskProject={id:string;name:string}
export function resolveTaskFilters(raw:{q?:string;status?:string;priority?:string;owner?:string;project?:string}){
 const q=(raw.q??'').trim().slice(0,80)
 return {q,status:knownTaskStatus(raw.status)?raw.status!:'all',
 priority:knownTaskPriority(raw.priority)?raw.priority!:'all',
 owner:isUuid(raw.owner)?raw.owner!:'all',project:isUuid(raw.project)?raw.project!:'all'}
}
export async function taskOptions(){
 await requireMember()
 const sql=db()
 const [members,projects]=await Promise.all([
 sql`SELECT id,name,slot FROM hub_members WHERE activated_at IS NOT NULL ORDER BY slot`,
 sql`SELECT id,name FROM hub_projects WHERE status<>'archived' ORDER BY name LIMIT 250`
 ])
 return {members:members as TaskMember[],projects:projects as TaskProject[]}
}
export async function listTasks(filters:ReturnType<typeof resolveTaskFilters>){
 await requireMember()
 const sql=db()
 const {q,status,priority,owner,project}=filters
 const [rows,counts]=await Promise.all([
 sql`SELECT t.id,t.title,t.description,t.status,t.priority,t.due_on::text AS due_on,
 t.assigned_to,m.name AS assigned_name,t.project_id,p.name AS project_name,
 t.created_at::text AS created_at,t.updated_at::text AS updated_at,t.completed_at::text AS completed_at
 FROM hub_tasks t LEFT JOIN hub_members m ON m.id=t.assigned_to
 LEFT JOIN hub_projects p ON p.id=t.project_id
 WHERE (${status='all' OR t.status=${status) AND (${priority='all' OR t.priority=${priority)
 AND (${owner='all' OR t.assigned_to::text=${owner) AND (${project='all' OR t.project_id::text=${project)
 AND (${q='' OR position(lower(${q) in lower(t.title))>0
 OR position(lower(${q) in lower(coalesce(t.description,'')))>0
 OR position(lower(${q) in lower(coalesce(p.name,'')))>0)
 ORDER BY t.due_on ASC NULLS LAST,t.created_at DESC,t.id DESC LIMIT 120`,
 sql`SELECT count(*)::integer AS total FROM hub_tasks t LEFT JOIN hub_projects p ON p.id=t.project_id
 WHERE (${status='all' OR t.status=${status) AND (${priority='all' OR t.priority=${priority)
 AND (${owner='all' OR t.assigned_to::text=${owner) AND (${project='all' OR t.project_id::text=${project)
 AND (${q='' OR position(lower(${q) in lower(t.title))>0
 OR position(lower(${q) in lower(coalesce(t.description,'')))>0
 OR position(lower(${q) in lower(coalesce(p.name,'')))>0)`
 ])
 return {rows:rows as HubTask[],total:Number(counts[0]?.total??0)}
}
export async function getTask(id:string){
 await requireMember()
 if(!isUuid(id))return null
 const sql=db()
 const rows=await sql`SELECT t.id,t.title,t.description,t.status,t.priority,t.due_on::text AS due_on,
 t.assigned_to,m.name AS assigned_name,t.project_id,p.name AS project_name,
 t.created_at::text AS created_at,t.updated_at::text AS updated_at,t.completed_at::text AS completed_at
 FROM hub_tasks t LEFT JOIN hub_members m ON m.id=t.assigned_to
 LEFT JOIN hub_projects p ON p.id=t.project_id WHERE t.id::text=${id LIMIT 1`
 return (rows[0] as HubTask|undefined)??null
}
