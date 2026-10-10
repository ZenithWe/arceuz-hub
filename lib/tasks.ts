
import 'server-only'
import { db } from './db'
import { requireMember } from './auth'
import { isUUID,knownTaskStatus,knownTaskPriority } from './task-fields.mjs'
export type TaskRow={
 id:string;title:string;description:string|null;status:string;priority:string;
 due_on:string|null;assigned_to:string|null;assignee_name:string|null;
 project_id:string|null;project_name:string|null;created_at:string;updated_at:string;completed_at:string|null
}
export type TaskOwner={id:string;name:string;slot:string}
export type TaskProject={id:string;name:string}
export function taskFilters(raw:{q?:string;status?:string;priority?:string;mine?:string;overdue?:string;page?:string}){
 const q=typeof raw.q==='string'?raw.q.trim().slice(0,80):''
 const status=knownTaskStatus(raw.status)?raw.status!:'all'
 const priority=knownTaskPriority(raw.priority)?raw.priority!:'all'
 const mine=raw.mine==='1',overdue=raw.overdue==='1'
 const x=Number(raw.page??1),page=Number.isSafeInteger(x)&&x>=1?Math.min(x,1000):1
 return {q,status,priority,mine,overdue,page}
}
export async function listTasks(filters:ReturnType<typeof taskFilters>){
 const member=await requireMember(),sql=db()
 const {q,status,priority,mine,overdue,page}=filters
 const offset=(page-1)*15
 const [rows,counts]=await Promise.all([
 sql`SELECT t.id,t.title,t.description,t.status,t.priority,t.due_on::text AS due_on,
 t.assigned_to,m.name AS assignee_name,t.project_id,p.name AS project_name,
 t.created_at::text AS created_at,t.updated_at::text AS updated_at,t.completed_at::text AS completed_at
 FROM hub_tasks t LEFT JOIN hub_projects p ON p.id=t.project_id LEFT JOIN hub_members m ON m.id=t.assigned_to
 WHERE (${status}='all' OR t.status=${status})
 AND (${priority}='all' OR t.priority=${priority})
 AND (${mine}=false OR t.assigned_to=${member.id})
 AND (${overdue}=false OR (t.due_on < (now() AT TIME ZONE 'America/Sao_Paulo')::date AND t.status<>'done'))
 AND (${q}='' OR position(lower(${q}) in lower(t.title))>0 OR position(lower(${q}) in lower(coalesce(p.name,'')))>0)
 ORDER BY (t.status='done') ASC,t.due_on ASC NULLS LAST,t.created_at DESC,t.id DESC
 LIMIT 15 OFFSET ${offset}`,
 sql`SELECT count(*)::integer AS total FROM hub_tasks t LEFT JOIN hub_projects p ON p.id=t.project_id
 WHERE (${status}='all' OR t.status=${status})
 AND (${priority}='all' OR t.priority=${priority})
 AND (${mine}=false OR t.assigned_to=${member.id})
 AND (${overdue}=false OR (t.due_on < (now() AT TIME ZONE 'America/Sao_Paulo')::date AND t.status<>'done'))
 AND (${q}='' OR position(lower(${q}) in lower(t.title))>0 OR position(lower(${q}) in lower(coalesce(p.name,'')))>0)`
 ])
 return {rows:rows as TaskRow[],total:Number(counts[0]?.total??0),perPage:15}
}
export async function taskSummary(){
 const member=await requireMember(),sql=db()
 const [result]=await sql`SELECT
 count(*)::integer AS total,
 count(*) FILTER(WHERE status='done')::integer AS done,
 count(*) FILTER(WHERE status<>'done')::integer AS open,
 count(*) FILTER(WHERE assigned_to=${member.id} AND status<>'done')::integer AS mine,
 count(*) FILTER(WHERE due_on < (now() AT TIME ZONE 'America/Sao_Paulo')::date AND status<>'done')::integer AS overdue
 FROM hub_tasks`
 return {total:Number(result.total),done:Number(result.done),open:Number(result.open),mine:Number(result.mine),overdue:Number(result.overdue)}
}
export async function getTask(id:string):Promise<TaskRow|null>{
 await requireMember()
 if(!isUUID(id))return null
 const sql=db()
 const rows=await sql`SELECT t.id,t.title,t.description,t.status,t.priority,t.due_on::text AS due_on,t.assigned_to,
 m.name AS assignee_name,t.project_id,p.name AS project_name,t.created_at::text AS created_at,
 t.updated_at::text AS updated_at,t.completed_at::text AS completed_at
 FROM hub_tasks t LEFT JOIN hub_projects p ON p.id=t.project_id LEFT JOIN hub_members m ON m.id=t.assigned_to
 WHERE t.id::text=${id} LIMIT 1`
 return (rows[0] as TaskRow|undefined)??null
}
export async function taskOptions(){
 await requireMember()
 const sql=db()
 const [owners,projects]=await Promise.all([
 sql`SELECT id,name,slot FROM hub_members WHERE activated_at IS NOT NULL ORDER BY slot`,
 sql`SELECT id,name FROM hub_projects WHERE status<>'archived' ORDER BY name ASC LIMIT 300`
 ])
 return {owners:owners as TaskOwner[],projects:projects as TaskProject[]}
}
