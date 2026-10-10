import 'server-only'
import { db } from './db'
export type ActivityAction=
 'login'|'logout'|'client_created'|'client_updated'|'client_project_linked'|'client_project_unlinked'|
 'project_created'|'project_updated'|'project_archived'|'task_created'|'task_updated'|
 'task_status_changed'|'profile_updated'|'password_changed'|
 'finance_created'|'finance_updated'|'finance_status_changed'
export type ActivityEntity='client'|'project'|'task'|'finance'
export async function recordActivity(memberId:string,action:ActivityAction,entityType:ActivityEntity|null=null,entityId:string|null=null,subject=''){
 try{
  const sql=db()
  // Record business actions only; no passwords, tokens, IP addresses or personal browsing.
  await sql`INSERT INTO hub_activity_events(member_id,action,entity_type,entity_id,subject)
   VALUES(${memberId},${action},${entityType},${entityId},${subject.slice(0,160)})`
 }catch(error){console.error('Audit event failed',error instanceof Error?error.message:'unknown')}
}
