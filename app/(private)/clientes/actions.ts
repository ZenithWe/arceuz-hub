'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireMember } from '@/lib/auth'
import { db } from '@/lib/db'
import { normalizeClientInput } from '@/lib/client-fields.mjs'

type State={error:string}
function parse(form:FormData){
 const data:Record<string,unknown>={}
 for(const key of ['name','contact_name','email','phone','whatsapp','website','status','notes'])data[key]=form.get(key)
 return normalizeClientInput(data)
}
function validId(id:string){return /^[0-9a-f-]{36}$/i.test(id)}
export async function createClientAction(_prev:State,form:FormData):Promise<State>{
 await requireMember()
 const parsed=parse(form)
 if(!parsed.value)return {error:parsed.error??'Dados inválidos.'}
 const x=parsed.value
 let id:string
 try{
  const sql=db()
  const rows=await sql`INSERT INTO hub_clients(name,contact_name,email,phone,whatsapp,website,status,notes)
   VALUES(${x.name},${x.contact_name},${x.email},${x.phone},${x.whatsapp},${x.website},${x.status},${x.notes}) RETURNING id`
  id=String(rows[0].id)
 }catch{return {error:'Não foi possível cadastrar o cliente. Tente novamente.'}}
 revalidatePath('/clientes')
 redirect(`/clientes/${id}?criado=1`)
}
export async function editClientAction(id:string,_prev:State,form:FormData):Promise<State>{
 await requireMember()
 if(!validId(id))return {error:'Cliente inválido.'}
 const parsed=parse(form)
 if(!parsed.value)return {error:parsed.error??'Dados inválidos.'}
 const x=parsed.value
 try{
  const sql=db()
  const rows=await sql`UPDATE hub_clients SET name=${x.name},contact_name=${x.contact_name},
   email=${x.email},phone=${x.phone},whatsapp=${x.whatsapp},website=${x.website},
   status=${x.status},notes=${x.notes},updated_at=now()
   WHERE id::text=${id} RETURNING id`
  if(!rows.length)return {error:'Cliente não encontrado.'}
  await sql`UPDATE hub_projects SET client_name=${x.name} WHERE client_id::text=${id}`
 }catch{return {error:'Não foi possível atualizar o cliente.'}}
 revalidatePath('/clientes');revalidatePath(`/clientes/${id}`);revalidatePath('/projects')
 redirect(`/clientes/${id}?salvo=1`)
}
export async function attachProjectAction(clientId:string,form:FormData){
 await requireMember()
 if(!validId(clientId))redirect('/clientes')
 const projectId=String(form.get('project_id')??'')
 if(!validId(projectId))redirect(`/clientes/${clientId}?vinculo=erro`)
 const sql=db()
 const rows=await sql`UPDATE hub_projects SET client_id=c.id,client_name=c.name
  FROM hub_clients c WHERE c.id::text=${clientId}
  AND hub_projects.id::text=${projectId} AND hub_projects.client_id IS NULL RETURNING hub_projects.id`
 if(!rows.length)redirect(`/clientes/${clientId}?vinculo=erro`)
 revalidatePath('/projects');revalidatePath('/dashboard');revalidatePath('/clientes');revalidatePath(`/clientes/${clientId}`)
 redirect(`/clientes/${clientId}?vinculo=1`)
}
export async function detachProjectAction(clientId:string,projectId:string,_form:FormData){
 await requireMember()
 if(!validId(clientId)||!validId(projectId))redirect('/clientes')
 const sql=db()
 await sql`UPDATE hub_projects SET client_id=NULL,client_name=NULL WHERE id::text=${projectId} AND client_id::text=${clientId}`
 revalidatePath('/projects');revalidatePath('/dashboard');revalidatePath('/clientes');revalidatePath(`/clientes/${clientId}`)
 redirect(`/clientes/${clientId}?vinculo=removido`)
}
