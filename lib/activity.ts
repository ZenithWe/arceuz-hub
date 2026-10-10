import 'server-only'
import { db } from './db'
import { requireMember } from './auth'
export type ActivityEntity='client'|'project'|'task'
export type EmployeeInfo={id:string;name:string;email:string;title:string|null;avatar_url:string|null;slot:string;last_login_at:string|null;last_action:string|null;last_subject:string|null;last_action_at:string|null;event_count:number}
export type ActivityEvent={id:string;member_id:string;name:string;action:string;entity_type:ActivityEntity|null;entity_id:string|null;subject:string;created_at:string}
export async function employeeDashboard(employeeId?:string) {
 await requireMember()
 const sql=db()
 const employees=await sql`SELECT m.id,m.name,m.email,m.title,m.avatar_url,m.slot,
 m.last_seen_at::text AS last_login_at,
 last_event.action AS last_action,last_event.subject AS last_subject,
 last_event.created_at::text AS last_action_at,
 (SELECT count(*)::integer FROM hub_activity_events e WHERE e.member_id=m.id) AS event_count
 FROM hub_members m
 LEFT JOIN LATERAL(
   SELECT action,subject,created_at FROM hub_activity_events
   WHERE member_id=m.id ORDER BY created_at DESC,id DESC LIMIT 1
 ) last_event ON true
 WHERE m.slot IN('mateus','roberto')
 ORDER BY m.slot`
 const id=employeeId&&employees.some(e=>e.id===employeeId)?employeeId:'all'
 const entries=await sql`SELECT a.id::text AS id,a.member_id,m.name,a.action,a.entity_type,
 a.entity_id,a.subject,a.created_at::text AS created_at
 FROM hub_activity_events a JOIN hub_members m ON m.id=a.member_id
 WHERE (${id}='all' OR a.member_id::text=${id})
 ORDER BY a.created_at DESC,a.id DESC LIMIT 60`
 return {employees:employees as EmployeeInfo[],events:entries as ActivityEvent[],selected:id}
}
