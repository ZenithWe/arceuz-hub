import { parseBRLCents,validISODate,formatBRLInput } from './project-fields.mjs'
export const directions=[['income','Receita'],['expense','Despesa']]
export const statuses=[['pending','Pendente'],['paid','Concluído'],['cancelled','Cancelado']]
export const knownDirection=x=>directions.some(([k])=>k===x)
export const knownStatus=x=>statuses.some(([k])=>k===x)
export const directionName=x=>directions.find(([k])=>k===x)?.[1]??'Indefinido'
export const statusName=x=>statuses.find(([k])=>k===x)?.[1]??'Indefinido'
export function isFinanceId(value){return typeof value==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)}
export function parseFinanceEntry(raw){
 const get=k=>String(raw[k]??'').trim()
 const title=get('title'),direction=get('direction'),status=get('status')
 const amount=get('amount'),category=get('category'),method=get('method'),reference=get('reference')
 const notes=get('notes'),competence_on=get('competence_on'),due_on=get('due_on'),paid_on=get('paid_on')
 const project_id=get('project_id')
 if(title.length<3||title.length>140)return {error:'O título deve ter entre 3 e 140 caracteres.'}
 if(!knownDirection(direction)||!knownStatus(status))return {error:'Tipo ou situação inválidos.'}
 const amount_cents=parseBRLCents(amount)
 if(amount_cents===null||!Number.isSafeInteger(amount_cents)||amount_cents<=0||amount_cents>100000000000)return {error:'Informe um valor positivo de até R$ 1.000.000.000,00.'}
 if(category.length>90||method.length>80||reference.length>120||notes.length>3000)return {error:'Confira o tamanho dos campos.'}
 if(!validISODate(competence_on)||!validISODate(due_on)||!validISODate(paid_on))return {error:'Há uma data inválida.'}
 if(status==='paid'&&!paid_on)return {error:'Informe a data de conclusão do pagamento ou recebimento.'}
 if(status!=='paid'&&paid_on)return {error:'A data de pagamento só pode ser informada em lançamentos concluídos.'}
 if(project_id&&!isFinanceId(project_id))return {error:'Projeto inválido.'}
 return {value:{title,direction,status,amount_cents,category:category||null,method:method||null,
  reference:reference||null,notes,competence_on:competence_on||null,due_on:due_on||null,
  paid_on:paid_on||null,project_id:project_id||null}}
}
export function formatMoney(cents){
 const numeric=Number(cents)
 if(!Number.isSafeInteger(numeric))return 'Indisponível'
 const sign=numeric<0?'-':''
 const centsAbs=Math.abs(numeric)
 return sign+'R$ '+new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(centsAbs/100)
}
export function formatMoneyInput(cents){return formatBRLInput(cents)}
export function formatDate(value){if(!value)return 'Não informado';const v=String(value).slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(v)?v.slice(8)+'/'+v.slice(5,7)+'/'+v.slice(0,4):'Não informado'}
export function isPastDue(entry,today){return entry.status==='pending'&&typeof entry.due_on==='string'&&entry.due_on<today}
