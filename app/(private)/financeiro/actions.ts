'use server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireMember } from '@/lib/auth'
import { db } from '@/lib/db'
import { recordActivity } from '@/lib/activity-write'
import { parseFinanceEntry,isFinanceId } from '@/lib/finance-fields.mjs'
import { verifyFinanceProject } from '@/lib/finance'

type State={error:string}
function parse(form:FormData){
 const raw:Record<string,unknown>={}
 for(const k of ['title','direction','status','amount','category','method','reference','notes','competence_on','due_on','paid_on','project_id'])raw[k]=form.get(k)
 return parseFinanceEntry(raw)
}
function refresh(id?:string){
 revalidatePath('/financeiro');revalidatePath('/dashboard')
 if(id)revalidatePath('/financeiro/'+id)
}
export async function createFinanceAction(_prev:State,form:FormData):Promise<State>{
 const member=await requireMember()
 const parsed=parse(form)
 if(!parsed.value)return {error:parsed.error??'Dados inválidos.'}
 const x=parsed.value
 let newId:string
 try{
  if(!(await verifyFinanceProject(x.project_id)))return {error:'O projeto selecionado não existe.'}
  const sql=db()
  const rows=await sql`INSERT INTO hub_financial_entries(title,direction,status,amount_cents,
   category,method,reference,notes,competence_on,due_on,paid_on,project_id,created_by,updated_by)
   VALUES(${x.title},${x.direction},${x.status},${x.amount_cents},${x.category},
   ${x.method},${x.reference},${x.notes},${x.competence_on},${x.due_on},${x.paid_on},
   ${x.project_id},${member.id},${member.id}) RETURNING id`
  if(!rows.length)return {error:'Não foi possível criar o lançamento.'}
  newId=String(rows[0].id)
 }catch{
  return {error:'Não foi possível salvar. Confira se a referência já não foi usada.'}
 }
 await recordActivity(member.id,'finance_created','finance',newId,x.title)
 refresh(newId)
 redirect('/financeiro/'+newId+'?criado=1')
}
export async function editFinanceAction(id:string,_prev:State,form:FormData):Promise<State>{
 const member=await requireMember()
 if(!isFinanceId(id))return {error:'Lançamento inválido.'}
 const parsed=parse(form)
 if(!parsed.value)return {error:parsed.error??'Dados inválidos.'}
 const x=parsed.value
 try{
  if(!(await verifyFinanceProject(x.project_id)))return {error:'Projeto não encontrado.'}
  const sql=db()
  const rows=await sql`UPDATE hub_financial_entries SET
   title=${x.title},direction=${x.direction},status=${x.status},amount_cents=${x.amount_cents},
   category=${x.category},method=${x.method},reference=${x.reference},notes=${x.notes},
   competence_on=${x.competence_on},due_on=${x.due_on},paid_on=${x.paid_on},
   project_id=${x.project_id},updated_by=${member.id},updated_at=now()
   WHERE id::text=${id} RETURNING id`
  if(!rows.length)return {error:'Lançamento não encontrado.'}
 }catch{return {error:'Não foi possível atualizar. Confira se a referência já não está cadastrada.'}}
 await recordActivity(member.id,'finance_updated','finance',id,x.title)
 refresh(id)
 redirect('/financeiro/'+id+'?salvo=1')
}
export async function changeFinanceStatusAction(form:FormData){
 const member=await requireMember()
 const id=String(form.get('id')??''),status=String(form.get('status')??'')
 if(!isFinanceId(id)||!['pending','paid','cancelled'].includes(status))redirect('/financeiro?erro=1')
 const sql=db()
 // A "paid" action uses Brasília's current date. This is a manual accounting status, not payment verification.
 const rows=await sql`UPDATE hub_financial_entries SET status=${status},
 paid_on=CASE WHEN ${status}='paid' THEN COALESCE(paid_on,(now() AT TIME ZONE 'America/Sao_Paulo')::date) ELSE NULL END,
 updated_at=now(),updated_by=${member.id} WHERE id::text=${id} RETURNING title`
 if(rows[0])await recordActivity(member.id,'finance_status_changed','finance',id,String(rows[0].title))
 refresh(id)
 redirect('/financeiro?alterado=1')
}
