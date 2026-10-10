import {parseBRLCents,validISODate,formatBRLInput} from './project-fields.mjs'
export const proposalStatuses=[['draft','Rascunho'],['sent','Enviada'],['negotiation','Em negociação'],['accepted','Aprovada'],['rejected','Recusada']]
export const knownProposalStatus=s=>proposalStatuses.some(([k])=>k===s)
export const proposalStatusName=s=>proposalStatuses.find(([k])=>k===s)?.[1]??'Desconhecido'
export const isProposalId=s=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s)
export const formatProposalDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)?s.slice(8)+'/'+s.slice(5,7)+'/'+s.slice(0,4):'Não informada'
export function formatProposalMoney(cents){const n=Number(cents);if(!Number.isSafeInteger(n)||n<0)return 'Indisponível';return 'R$ '+new Intl.NumberFormat('pt-BR',{minimumFractionDigits:2,maximumFractionDigits:2}).format(n/100)}
export function normalizeProposalInput(raw){
 const get=k=>typeof raw[k]==='string'?raw[k].trim():''
 const title=get('title'),scope=get('scope'),delivery_terms=get('delivery_terms'),payment_terms=get('payment_terms'),notes=get('notes')
 const status=get('status'),valid_until=get('valid_until'),client_id=get('client_id'),project_id=get('project_id')
 const amount_cents=parseBRLCents(get('amount'))
 if(title.length<3||title.length>150)return {error:'Título deve ter entre 3 e 150 caracteres.'}
 if(scope.length<10||scope.length>8000)return {error:'Escopo deve ter entre 10 e 8.000 caracteres.'}
 if(delivery_terms.length>2500||payment_terms.length>2500||notes.length>3000)return {error:'Um campo de detalhes está muito longo.'}
 if(!knownProposalStatus(status))return {error:'Etapa da proposta inválida.'}
 if(!Number.isSafeInteger(amount_cents)||amount_cents<=0||amount_cents>100000000000)return {error:'Digite um valor válido maior que zero.'}
 if(!validISODate(valid_until))return {error:'Data de validade inválida.'}
 if(client_id&&!isProposalId(client_id))return {error:'Cliente inválido.'}
 if(project_id&&!isProposalId(project_id))return {error:'Projeto inválido.'}
 return {value:{title,scope,delivery_terms,payment_terms,notes,status,valid_until:valid_until||null,amount_cents,client_id:client_id||null,project_id:project_id||null}}
}
export const proposalInputMoney=formatBRLInput
