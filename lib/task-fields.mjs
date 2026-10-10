
export const taskStatuses=[['todo','A fazer'],['doing','Em andamento'],['review','Em revisão'],['done','Concluída']]
export const taskPriorities=[['low','Baixa'],['normal','Normal'],['high','Alta']]
export function knownTaskStatus(x){return taskStatuses.some(([key])=>key===x)}
export function knownTaskPriority(x){return taskPriorities.some(([key])=>key===x)}
export function taskStatusName(x){return taskStatuses.find(([key])=>key===x)?.[1]??'Indefinido'}
export function taskPriorityName(x){return taskPriorities.find(([key])=>key===x)?.[1]??'Indefinida'}
export function isUUID(x){return typeof x==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(x)}
export function isTaskDate(input){
 if(!/^\d{4}-\d{2}-\d{2}$/.test(input))return false
 const [year,month,day]=input.split('-').map(Number)
 if(year<2000||year>2100||month<1||month>12||day<1||day>31)return false
 const dt=new Date(Date.UTC(year,month-1,day))
 return dt.getUTCFullYear()===year&&dt.getUTCMonth()===month-1&&dt.getUTCDate()===day
}
export function brDate(input){return input?input.split('-').reverse().join('/'):'Sem prazo'}
export function parseTaskFields(raw){
 const get=key=>typeof raw[key]==='string'?raw[key].trim():''
 const title=get('title'),description=get('description'),priority=get('priority'),status=get('status')
 const due_on=get('due_on'),assigned_to=get('assigned_to'),project_id=get('project_id')
 if(title.length<3||title.length>160)return {error:'O título precisa ter de 3 a 160 caracteres.'}
 if(description.length>3000)return {error:'Descrição muito longa (limite de 3.000 caracteres).'}
 if(!knownTaskPriority(priority))return {error:'Prioridade inválida.'}
 if(!knownTaskStatus(status))return {error:'Status inválido.'}
 if(due_on&&!isTaskDate(due_on))return {error:'Data de prazo inválida.'}
 if(assigned_to&&!isUUID(assigned_to))return {error:'Responsável inválido.'}
 if(project_id&&!isUUID(project_id))return {error:'Projeto inválido.'}
 return {value:{title,description,priority,status,due_on:due_on||null,assigned_to:assigned_to||null,project_id:project_id||null}}
}
