
'use client'
import {useActionState} from 'react'
import {useFormStatus} from 'react-dom'
import Link from 'next/link'
import {ArrowLeft,Save} from 'lucide-react'
import {taskStatuses,taskPriorities} from '@/lib/task-fields.mjs'
import {createTaskAction,editTaskAction} from '@/app/(private)/tarefas/actions'
import type {TaskRow,TaskOwner,TaskProject} from '@/lib/tasks'
function Submit(){const {pending}=useFormStatus();return <button className="primary-button" disabled={pending} type="submit"><Save size={16}/>{pending?'Salvando...':'Salvar tarefa'}</button>}
export function TaskForm({task,owners,projects}:{task?:TaskRow;owners:TaskOwner[];projects:TaskProject[]}){
 const action=task?editTaskAction.bind(null,task.id):createTaskAction
 const [state,formAction]=useActionState(action,{error:''})
 return <form action={formAction} className="panel project-editor">
 <div className="section-heading"><div><h2>Dados da tarefa</h2><p>Defina a entrega, o prazo e quem ficará responsável.</p></div></div>
 <div className="project-form-grid">
  <div className="field project-wide"><label htmlFor="task-title">Título *</label><input id="task-title" name="title" minLength={3} maxLength={160} required defaultValue={task?.title??''} placeholder="Ex.: Publicar a nova versão do site"/></div>
  <div className="field"><label htmlFor="task-status">Status</label><select id="task-status" name="status" defaultValue={task?.status??'todo'}>{taskStatuses.map(([k,name])=><option key={k} value={k}>{name}</option>)}</select></div>
  <div className="field"><label htmlFor="task-priority">Prioridade</label><select id="task-priority" name="priority" defaultValue={task?.priority??'normal'}>{taskPriorities.map(([k,name])=><option value={k} key={k}>{name}</option>)}</select></div>
  <div className="field"><label htmlFor="task-owner">Responsável</label><select name="assigned_to" id="task-owner" defaultValue={task?.assigned_to??''}><option value="">Sem responsável</option>{owners.map(o=><option key={o.id} value={o.id}>{o.name}</option>)}</select></div>
  <div className="field"><label htmlFor="task-due">Prazo</label><input id="task-due" name="due_on" type="date" defaultValue={task?.due_on??''}/></div>
  <div className="field project-wide"><label htmlFor="task-project">Projeto vinculado</label><select id="task-project" name="project_id" defaultValue={task?.project_id??''}><option value="">Sem projeto</option>{projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}{task?.project_id&&!projects.some(p=>p.id===task.project_id)&&<option value={task.project_id}>{task.project_name??'Projeto arquivado'}</option>}</select></div>
  <div className="field project-wide"><label htmlFor="task-desc">Descrição e orientações</label><textarea id="task-desc" name="description" maxLength={3000} rows={5} defaultValue={task?.description??''} placeholder="Detalhes da entrega, critérios de aprovação, links úteis..."/></div>
 </div>
 {state.error&&<div role="alert" className="error-banner project-form-error">{state.error}</div>}
 <div className="project-form-actions"><Link href="/tarefas" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link><Submit/></div>
 </form>
}
