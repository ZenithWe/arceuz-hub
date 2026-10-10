import Link from 'next/link'
import { ListTodo,Plus,Search,CalendarDays,UserRound,FolderKanban,ArrowUpRight,CheckCheck,Clock3 } from 'lucide-react'
import { listTasks,taskOptions,resolveTaskFilters } from '@/lib/tasks'
import { taskStatuses,taskPriorities,taskPriorityName,formatTaskDate,isOverdue } from '@/lib/task-fields.mjs'
import { changeTaskStatusAction } from './actions'

export const metadata={title:'Tarefas'}
export const dynamic='force-dynamic'
type Filters={q?:string;status?:string;priority?:string;owner?:string;project?:string;criada?:string;atualizada?:string;erro?:string}
export default async function TasksPage({searchParams}:{searchParams:Promise<Filters>}){
 const params=await searchParams, filters=resolveTaskFilters(params)
 const [data,options]=await Promise.all([listTasks(filters),taskOptions()])
 const rows=data.rows,today=new Date().toISOString().slice(0,10)
 const counts=Object.fromEntries(taskStatuses.map(([k])=>[k,rows.filter(t=>t.status===k).length]))
 return <div className="task-board-page">
 <div className="page-header"><div><div className="page-eyebrow">ARCEUZ HUB / EQUIPE</div><h1>Tarefas</h1><p>Organize prioridades, acompanhe prazos e divida o trabalho entre Mateus e Roberto.</p></div><Link href="/tarefas/novo" className="primary-button"><Plus size={16}/> Nova tarefa</Link></div>
 {(params.criada==='1'||params.atualizada==='1')&&<p className="project-success" role="status">{params.criada==='1'?'Tarefa criada com sucesso.':'Etapa da tarefa atualizada.'}</p>}
 {params.erro==='1'&&<p className="error-banner" role="alert">Não foi possível alterar a etapa.</p>}
 <div className="task-overview"><div className="panel task-summary"><ListTodo size={21}/><b>{data.total}</b><span>Tarefas encontradas</span></div><div className="panel task-summary"><CheckCheck size={21}/><b>{rows.filter(t=>t.status==='done').length}</b><span>Concluídas na listagem</span></div><div className="panel task-summary"><Clock3 size={21}/><b>{rows.filter(t=>isOverdue(t.due_on,t.status,today)).length}</b><span>Atrasadas na listagem</span></div></div>
 <form method="GET" action="/tarefas" className="panel task-filters">
 <label className="project-search"><Search size={17}/><input name="q" type="search" aria-label="Pesquisar tarefas" maxLength={80} defaultValue={filters.q} placeholder="Buscar tarefa ou projeto"/></label>
 <select name="status" defaultValue={filters.status} aria-label="Filtrar por etapa"><option value="all">Todas as etapas</option>{taskStatuses.map(([k,t])=><option key={k} value={k}>{t}</option>)}</select>
 <select name="priority" defaultValue={filters.priority} aria-label="Filtrar prioridade"><option value="all">Todas as prioridades</option>{taskPriorities.map(([k,t])=><option key={k} value={k}>{t}</option>)}</select>
 <select name="owner" defaultValue={filters.owner} aria-label="Filtrar responsável"><option value="all">Toda a equipe</option>{options.members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select>
 <select name="project" defaultValue={filters.project} aria-label="Filtrar projeto"><option value="all">Todos os projetos</option>{options.projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
 <button type="submit" className="ghost-button">Filtrar</button>
 </form>
 {data.total>120?<p className="task-limit">Mostrando 120 tarefas. Use os filtros para localizar as demais.</p>:null}
 <div className="task-columns">
 {taskStatuses.map(([status,name])=><section className="task-column" aria-label={name} key={status}>
  <div className="task-column-header"><div className="task-column-heading"><span className={'task-dot task-dot-'+status}/><h2>{name}</h2></div><span className="task-column-count">{counts[status]??0}</span></div>
  <div className="task-column-items">
  {rows.filter(t=>t.status===status).map(t=><article className="task-card" key={t.id}>
   <div className="task-card-head"><span className={'task-priority task-priority-'+t.priority}>{taskPriorityName(t.priority)}</span>{isOverdue(t.due_on,t.status,today)?<span className="task-overdue">Atrasada</span>:null}</div>
   <Link href={'/tarefas/'+t.id} className="task-card-title">{t.title}<ArrowUpRight size={15}/></Link>
   {t.description?<p className="task-card-description">{t.description}</p>:null}
   <div className="task-card-meta">{t.project_name?<span><FolderKanban size={14}/>{t.project_name}</span>:null}<span><UserRound size={14}/>{t.assigned_name??'Não atribuída'}</span><span><CalendarDays size={14}/>{formatTaskDate(t.due_on)}</span></div>
   <form action={changeTaskStatusAction} className="task-card-move"><input name="id" type="hidden" value={t.id}/><label htmlFor={'next-'+t.id}>Mover para</label><select id={'next-'+t.id} name="status" defaultValue={t.status}>{taskStatuses.map(([k,text])=><option key={k} value={k}>{text}</option>)}</select><button type="submit" className="task-move-button" aria-label={'Atualizar etapa de '+t.title}>OK</button></form>
  </article>)}
  {!counts[status]?<p className="task-column-empty">Nenhuma tarefa nesta etapa.</p>:null}
  </div>
 </section>)}
 </div>
 {!rows.length&&<div className="panel task-empty-state"><ListTodo size={35}/><h2>{filters.q||filters.status!=='all'||filters.owner!=='all'||filters.project!=='all'||filters.priority!=='all'?'Nenhuma tarefa encontrada.':'Sua lista começa aqui.'}</h2><p>Crie a primeira tarefa, defina um responsável e acompanhe cada etapa.</p><Link className="primary-button" href="/tarefas/novo"><Plus size={16}/> Criar tarefa</Link></div>}
 </div>
}
