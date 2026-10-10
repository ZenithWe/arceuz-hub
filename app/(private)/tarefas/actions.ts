
'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireMember } from '@/lib/auth'
import { db } from '@/lib/db'
import { recordActivity } from '@/lib/activity-write'
import { isUUID,parseTaskFields,knownTaskStatus } from '@/lib/task-fields.mjs'
type TaskState={error:string}
function dataFrom(form:FormData){
 const raw:Record<string,unknown>={}
 for(const key of ['title','description','priority','status','due_on','assigned_to','project_id'])raw[key]=form.get(key)
 return parseTaskFields(raw)
}
async function validateRefs(assigned_to:string|null,project_id:string|null){
 const sql=db()
 if(assigned_to){
  const owners=await sql`SELECT id FROM hub_members WHERE id::text=${assigned_to} AND activated_at IS NOT NULL LIMIT 1`
  if(!owners.length)return 'Responsável não autorizado.'
 }
 if(project_id){
  const projects=await sql`SELECT id FROM hub_projects WHERE id::text=${project_id} AND status<>'archived' LIMIT 1`
  if(!projects.length)return 'Projeto não encontrado ou arquivado.'
 }
 return null
}
function refresh(id?:string){revalidatePath('/tarefas');revalidatePath('/dashboard');if(id)revalidatePath(`/tarefas/${id}`)}
export async function createTaskAction(_previous:TaskState,form:FormData):Promise<TaskState>{
 const member=await requireMember()
 const p=dataFrom(form)
 if(!p.value)return {error:p.error??'Dados inválidos.'}
 const x=p.value,relationError=await validateRefs(x.assigned_to,x.project_id)
 if(relationError)return {error:relationError}
 let id:string
 try{
  const sql=db()
  const rows=await sql`INSERT INTO hub_tasks(title,description,priority,status,due_on,assigned_to,project_id,completed_at)
  VALUES(${x.title},${x.description},${x.priority},${x.status},${x.due_on},${x.assigned_to},${x.project_id},
  CASE WHEN ${x.status}='done' THEN now() ELSE NULL END)
  RETURNING id`
  id=String(rows[0].id)
 }catch{return {error:'Não foi possível criar a tarefa.'}}
 await recordActivity(member.id,'task_created','task',id,x.title)
 refresh(id)
 redirect(`/tarefas/${id}?criada=1`)
}
export async function editTaskAction(id:string,_previous:TaskState,form:FormData):Promise<TaskState>{
 const member=await requireMember()
 if(!isUUID(id))return {error:'Tarefa inválida.'}
 const p=dataFrom(form)
 if(!p.value)return {error:p.error??'Dados inválidos.'}
 const x=p.value,relationError=await validateRefs(x.assigned_to,x.project_id)
 if(relationError)return {error:relationError}
 try{
  const sql=db()
  const rows=await sql`UPDATE hub_tasks SET title=${x.title},description=${x.description},priority=${x.priority},
  status=${x.status},due_on=${x.due_on},assigned_to=${x.assigned_to},project_id=${x.project_id},
  updated_at=now(),completed_at=CASE WHEN ${x.status}='done' THEN COALESCE(completed_at,now()) ELSE NULL END
  WHERE id::text=${id} RETURNING id`
  if(!rows.length)return {error:'Tarefa não encontrada.'}
 }catch{return {error:'Não foi possível salvar a tarefa.'}}
 await recordActivity(member.id,'task_updated','task',id,x.title)
 refresh(id)
 redirect(`/tarefas/${id}?salva=1`)
}
export async function quickTaskStatusAction(form:FormData){
 const member=await requireMember()
 const id=String(form.get('id')??''),status=String(form.get('status')??'')
 if(!isUUID(id)||!knownTaskStatus(status))redirect('/tarefas')
 const sql=db()
 const rows=await sql`UPDATE hub_tasks SET status=${status},updated_at=now(),
 completed_at=CASE WHEN ${status}='done' THEN COALESCE(completed_at,now()) ELSE NULL END WHERE id::text=${id} RETURNING title`
 if(rows[0])await recordActivity(member.id,'task_status_changed','task',id,String(rows[0].title))
 refresh(id)
 redirect('/tarefas?alterada=1')
}
