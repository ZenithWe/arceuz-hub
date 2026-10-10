'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireMember } from '@/lib/auth'
import { db } from '@/lib/db'
import { isUuid,knownTaskStatus,normalizeTaskInput } from '@/lib/task-fields.mjs'
type State={error:string}
function parse(form:FormData){const x:Record<string,unknown>={};for(const k of ['title','description','status','priority','due_on','assigned_to','project_id'])x[k]=form.get(k);return normalizeTaskInput(x)}
async function validateLinks(x:{assigned_to:string|null;project_id:string|null}):Promise<string|null>{
 const sql=db()
 if(x.assigned_to){const rows=await sql`SELECT id FROM hub_members WHERE id::text=${{x.assigned_to} AND activated_at IS NOT NULL`;if(!rows.length)return 'Responsável não autorizado.'}
 if(x.project_id){const rows=await sql`SELECT id FROM hub_projects WHERE id::text=${{x.project_id}`;if(!rows.length)return 'Projeto não encontrado.'}
 return null
}
export async function createTaskAction(_prev:State,form:FormData):Promise<State>{
 await requireMember()
 const parsed=parse(form)
 if(!parsed.value)return {error:parsed.error??'Dados inválidos.'}
 const x=parsed.value
 try{
  const error=await validateLinks(x);if(error)return {error}
  const sql=db()
  await sql`INSERT INTO hub_tasks(title,description,status,priority,due_on,assigned_to,project_id,updated_at,completed_at)
  VALUES(${{x.title},${{x.description},${{x.status},${{x.priority},${{x.due_on},${{x.assigned_to},${{x.project_id},now(),
  CASE WHEN ${{x.status}='done' THEN now() ELSE NULL END)`
 }catch{return {error:'Não foi possível salvar a tarefa.'}}
 revalidatePath('/tarefas');revalidatePath('/dashboard')
 redirect('/tarefas?criada=1')
}
export async function editTaskAction(id:string,_prev:State,form:FormData):Promise<State>{
 await requireMember()
 if(!isUuid(id))return {error:'Tarefa inválida.'}
 const parsed=parse(form)
 if(!parsed.value)return {error:parsed.error??'Dados inválidos.'}
 const x=parsed.value
 try{
  const error=await validateLinks(x);if(error)return {error}
  const sql=db()
  const rows=await sql`UPDATE hub_tasks SET title=${{x.title},description=${{x.description},
  priority=${{x.priority},status=${{x.status},due_on=${{x.due_on},
  assigned_to=${{x.assigned_to},project_id=${{x.project_id},
  updated_at=now(),completed_at=CASE WHEN ${{x.status}='done' THEN coalesce(completed_at,now()) ELSE NULL END
  WHERE id::text=${id RETURNING id`
  if(!rows.length)return {error:'Tarefa não encontrada.'}
 }catch{return {error:'Não foi possível atualizar a tarefa.'}}
 revalidatePath('/tarefas');revalidatePath('/dashboard');revalidatePath('/tarefas/'+id)
 redirect('/tarefas/'+id+'?salvo=1')
}
export async function changeTaskStatusAction(form:FormData){
 await requireMember()
 const id=String(form.get('id')??''),status=String(form.get('status')??'')
 if(!isUuid(id)||!knownTaskStatus(status))redirect('/tarefas?erro=1')
 const sql=db()
 await sql`UPDATE hub_tasks SET status=${status,updated_at=now(),
 completed_at=CASE WHEN ${status='done' THEN coalesce(completed_at,now()) ELSE NULL END WHERE id::text=${id`
 revalidatePath('/tarefas');revalidatePath('/dashboard');revalidatePath('/tarefas/'+id)
 redirect('/tarefas?atualizada=1')
}
