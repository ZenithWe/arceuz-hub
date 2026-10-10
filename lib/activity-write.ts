import 'server-only'
import { db } from './db'
export type ActivityAction=
 'login'|'logout'|'client_created'|'client_updated'|'client_project_linked'|'client_project_unlinked'|
 'project_created'|'project_updated'|'project_archived'|'task_created'|'task_updated'|
 'task_status_changed'|'profile_updated'|'password_changed'
export type ActivityEntity='client'|'project'|'task'
export async function recordActivity(memberId:string,action:ActivityAction,entityType:ActivityEntity|null=null,entityId:string|null=null,subject=''){
 try{
  const sql=db()
  // Only business actions. Never persist credentials, session tokens, IPs or browser tracking.
  await sql`INSERT INTO hub_activity_events(member_id,action,entity_type,entity_id,subject)
   VALUES(${memberId,${action,${entityType,${entityId,${{subject.slice(0,160)})`
 }catch(error){console.error('Audit event failed',error instanceof Error?error.message:'unknown')}
}
