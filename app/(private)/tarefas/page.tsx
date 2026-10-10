
import Link from 'next/link'
import {ListTodo,Plus,Search,Clock3,UserRound,CheckCircle2,CalendarClock,ArrowUpRight,FolderKanban} from 'lucide-react'
import {listTasks,taskSummary,taskFilters} from '@/lib/tasks'
import {taskStatuses,taskPriorities,taskStatusName,taskPriorityName,brDate} from '@/lib/task-fields.mjs'
import {quickTaskStatusAction} from './actions'
export const metadata={title:'Tarefas'}
export default async function TasksPage({searchParams}:{searchParams:Promise<{q?:string;status?:string;priority?:string;mine?:string;overdue?:string;page?:string;alterada?:string}>}){
 const raw=await searchParams,filters=taskFilters(raw)
 const [data,summary]=await Promise.all([listTasks(filters),taskSummary()])
 const pages=Math.max(1,Math.ceil(data.total/data.perPage))
 const urlFor=(page:number)=>'/tarefas?'+new URLSearchParams({q:filters.q,status:filters.status,priority:filters.priority,mine:filters.mine?'1':'0',overdue:filters.overdue?'1':'0',page:String(page)}).toString()
 return <div className="tasks-page">
  <div className="page-header"><div><div className="page-eyebrow">ARCEUZ HUB · MÓDULO TAREFAS</div><h1>Tarefas</h1><p>Acompanhe entregas, prioridades e responsáveis em tempo real.</p></div><Link href="/tarefas/novo" className="primary-button"><Plus size={16}/> Nova tarefa</Link></div>
  <div className="task-kpis">
   <div className="panel task-kpi"><ListTodo size={20}/><div><b>{summary.open}</b><span>Em aberto</span></div></div>
   <div className="panel task-kpi"><UserRound size={20}/><div><b>{summary.mine}</b><span>Minhas tarefas abertas</span></div></div>
   <div className="panel task-kpi"><CalendarClock size={20}/><div><b>{summary.overdue}</b><span>Atrasadas</span></div></div>
   <div className="panel task-kpi"><CheckCircle2 size={20}/><div><b>{summary.done}</b><span>Concluídas</span></div></div>
  </div>
  {raw.alterada==='1'&&<p role="status" className="project-success">Status atualizado com sucesso.</p>}
  <form className="panel task-filters" method="GET" action="/tarefas">
   <label className="task-search"><Search size={16}/><input name="q" type="search" maxLength={80} defaultValue={filters.q} aria-label="Pesquisar tarefas" placeholder="Pesquisar tarefa ou projeto"/></label>
   <select name="status" aria-label="Filtrar status" defaultValue={filters.status}><option value="all">Todos os status</option>{taskStatuses.map(([k,n])=><option key={k} value={k}>{n}</option>)}</select>
   <select name="priority" aria-label="Filtrar prioridade" defaultValue={filters.priority}><option value="all">Todas as prioridades</option>{taskPriorities.map(([k,n])=><option key={k} value={k}>{n}</option>)}</select>
   <label className="task-check"><input name="mine" type="checkbox" value="1" defaultChecked={filters.mine}/> Só minhas</label>
   <label className="task-check"><input name="overdue" type="checkbox" value="1" defaultChecked={filters.overdue}/> Atrasadas</label>
   <button type="submit" className="ghost-button">Filtrar</button>
  </form>
  {data.rows.length?<div className="task-list">{data.rows.map(task=>{
   const next=task.status==='todo'?'doing':task.status==='doing'?'review':task.status==='review'?'done':'todo'
   const actionLabel=task.status==='todo'?'Iniciar':task.status==='doing'?'Enviar para revisão':task.status==='review'?'Concluir':'Reabrir'
   return <article className="panel task-item" key={task.id}>
    <div className="task-item-main"><div className="task-heading"><span className={'task-status status-task-'+task.status}>{taskStatusName(task.status)}</span><span className={'task-priority priority-'+task.priority}>{taskPriorityName(task.priority)}</span></div><Link href={'/tarefas/'+task.id} className="task-name">{task.title}<ArrowUpRight size={16}/></Link><p className="task-preview">{task.description||'Sem descrição adicional.'}</p>
    <div className="task-meta"><span><UserRound size={14}/>{task.assignee_name||'Não atribuída'}</span><span><FolderKanban size={14}/>{task.project_name||'Sem projeto'}</span><span><Clock3 size={14}/>{brDate(task.due_on)}</span></div></div>
    <div className="task-controls"><form action={quickTaskStatusAction}><input type="hidden" name="id" value={task.id}/><input type="hidden" name="status" value={next}/><button className="ghost-button" type="submit">{actionLabel}</button></form><Link href={'/tarefas/'+task.id} className="task-edit">Editar</Link></div>
   </article>
  })}</div>:<section className="panel projects-empty"><ListTodo size={35}/><h2>{filters.q||filters.status!=='all'||filters.mine||filters.overdue?'Nenhuma tarefa encontrada':'Sua lista está vazia'}</h2><p>{filters.q||filters.status!=='all'||filters.mine||filters.overdue?'Tente ajustar os filtros.':'Cadastre uma tarefa e comece a acompanhar suas entregas.'}</p><Link href="/tarefas/novo" className="primary-button"><Plus size={16}/> Criar tarefa</Link></section>}
  {pages>1&&<nav className="project-pagination" aria-label="Paginação de tarefas"><span>Página {filters.page} de {pages}</span><div>{filters.page>1&&<Link href={urlFor(filters.page-1)} className="ghost-button">Anterior</Link>}{filters.page<pages&&<Link href={urlFor(filters.page+1)} className="ghost-button">Próxima</Link>}</div></nav>}
 </div>
}
