'use server'
import {revalidatePath} from 'next/cache'
import {redirect} from 'next/navigation'
import {requireMember} from '@/lib/auth'
import {db} from '@/lib/db'
import {recordActivity} from '@/lib/activity-write'
import {normalizeProposalInput,isProposalId,knownProposalStatus} from '@/lib/proposal-fields.mjs'
import {validateProposalRefs} from '@/lib/proposals'
type State={error:string}
function parsed(form:FormData){
 const raw:Record<string,unknown>={}
 for(const k of ['title','scope','delivery_terms','payment_terms','notes','status','valid_until','amount','client_id','project_id'])raw[k]=form.get(k)
 return normalizeProposalInput(raw)
}
function refresh(id?:string){revalidatePath('/propostas');revalidatePath('/dashboard');if(id){revalidatePath('/propostas/'+id);revalidatePath('/propostas/'+id+'/imprimir')}}
export async function createProposalAction(_prev:State,form:FormData):Promise<State>{
 const member=await requireMember(),data=parsed(form)
 if(!data.value)return {error:data.error??'Dados inválidos.'}
 const x=data.value
 const refs=await validateProposalRefs(x.client_id,x.project_id)
 if(refs)return {error:refs}
 let id:string
 try{
  const sql=db()
  const rows=await sql`INSERT INTO hub_proposals(title,client_id,project_id,amount_cents,scope,delivery_terms,payment_terms,notes,status,valid_until,created_by,updated_by)
  VALUES(${x.title},${x.client_id},${x.project_id},${x.amount_cents},${x.scope},${x.delivery_terms},
  ${x.payment_terms},${x.notes},${x.status},${x.valid_until},${member.id},${member.id}) RETURNING id`
  id=String(rows[0].id)
 }catch{return {error:'Não foi possível cadastrar a proposta.'}}
 await recordActivity(member.id,'proposal_created','proposal',id,x.title)
 refresh(id);redirect('/propostas/'+id+'?criada=1')
}
export async function editProposalAction(id:string,_prev:State,form:FormData):Promise<State>{
 const member=await requireMember()
 if(!isProposalId(id))return {error:'Proposta inválida.'}
 const data=parsed(form)
 if(!data.value)return {error:data.error??'Dados inválidos.'}
 const x=data.value,refs=await validateProposalRefs(x.client_id,x.project_id)
 if(refs)return {error:refs}
 try{
  const sql=db()
  const rows=await sql`UPDATE hub_proposals SET title=${x.title},client_id=${x.client_id},project_id=${x.project_id},
  amount_cents=${x.amount_cents},scope=${x.scope},delivery_terms=${x.delivery_terms},
  payment_terms=${x.payment_terms},notes=${x.notes},status=${x.status},
  valid_until=${x.valid_until},updated_at=now(),updated_by=${member.id}
  WHERE id::text=${id} RETURNING id`
  if(!rows.length)return {error:'Proposta não encontrada.'}
 }catch{return {error:'Não foi possível salvar a proposta.'}}
 await recordActivity(member.id,'proposal_updated','proposal',id,x.title)
 refresh(id);redirect('/propostas/'+id+'?salva=1')
}
export async function changeProposalStatusAction(form:FormData){
 const member=await requireMember()
 const id=String(form.get('id')??''),status=String(form.get('status')??'')
 if(!isProposalId(id)||!knownProposalStatus(status))redirect('/propostas?erro=1')
 const sql=db()
 const rows=await sql`UPDATE hub_proposals SET status=${status},updated_at=now(),updated_by=${member.id} WHERE id::text=${id} RETURNING title`
 if(!rows.length)redirect('/propostas?erro=1')
 await recordActivity(member.id,'proposal_updated','proposal',id,String(rows[0].title))
 refresh(id);redirect('/propostas?atualizada=1')
}
export async function deleteProposalAction(id:string,form:FormData){
 const member=await requireMember()
 if(!isProposalId(id)||String(form.get('confirmation')??'')!=='EXCLUIR')redirect('/propostas/'+id+'?confirmar=1')
 const sql=db()
 const rows=await sql`DELETE FROM hub_proposals WHERE id::text=${id} RETURNING title`
 if(!rows.length)redirect('/propostas?erro=1')
 await recordActivity(member.id,'proposal_deleted','proposal',id,String(rows[0].title))
 refresh(id);redirect('/propostas?excluida=1')
}
