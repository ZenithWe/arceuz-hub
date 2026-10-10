import { validISODate } from './project-fields.mjs'
export const taskStatuses=[['todo','A fazer'],['doing','Em andamento'],['review','Em revisão'],['done','Concluída']]
export const taskPriorities=[['low','Baixa'],['normal','Normal'],['high','Alta']]
export const knownTaskStatus=v=>taskStatuses.some(([k])=>k===v)
export const knownTaskPriority=v=>taskPriorities.some(([k])=>k===v)
export const taskStatusName=v=>taskStatuses.find(([k])=>k===v)?.[1]??'Não informado'
export const taskPriorityName=v=>taskPriorities.find(([k])=>k===v)?.[1]??'Não informada'
export const isUuid=v=>typeof v==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v)
export function normalizeTaskInput(raw) {
 const get=k=>String(raw[k]??'').trim()
 const title=get('title'),description=get('description'),status=get('status'),priority=get('priority')
 const due_on=get('due_on'),assigned_to=get('assigned_to'),project_id=get('project_id')
 if(title.length<3||title.length>160)return {error:'O título precisa ter de 3 a 160 caracteres.'}
 if(description.length>4000)return {error:'A descrição deve ter até 4.000 caracteres.'}
 if(!knownTaskStatus(status)||!knownTaskPriority(priority))return {error:'Status ou prioridade inválidos.'}
 if(!validISODate(due_on))return {error:'Informe uma data válida.'}
 if(assigned_to&&!isUuid(assigned_to))return {error:'Responsável inválido.'}
 if(project_id&&!isUuid(project_id))return {error:'Projeto inválido.'}
 return {value:{title,description,status,priority,due_on:due_on||null,assigned_to:assigned_to||null,project_id:project_id||null}}
}
export function isOverdue(date,status,today){return typeof date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(date)&&status!=='done'&&date<today}
export function formatTaskDate(date){if(!date)return 'Sem prazo';const d=String(date).slice(0,10);return /^\d{4}-\d{2}-\d{2}$/.test(d)?d.slice(8)+'/'+d.slice(5,7)+'/'+d.slice(0,4):'Sem prazo'}
