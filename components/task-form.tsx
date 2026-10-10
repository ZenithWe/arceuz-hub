'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Save, ArrowLeft } from 'lucide-react'
import { taskPriorities,taskStatuses } from '@/lib/task-fields.mjs'
import type { HubTask,TaskMember,TaskProject } from '@/lib/tasks'
import { createTaskAction,editTaskAction } from '@/app/(private)/tarefas/actions'

function SaveButton(){const {pending}=useFormStatus();return <button type="submit" className="primary-button" disabled={pending}><Save size={16}/>{pending?'Salvando...':'Salvar tarefa'}</button>}
export function TaskForm({task,members,projects}:{task?:HubTask;members:TaskMember[];projects:TaskProject[]}){
 const action=task?editTaskAction.bind(null,task.id):createTaskAction
 const [state,submit]=useActionState(action,{error:''})
 return <form action={submit} className="panel project-editor">
 <div className="section-heading"><div><h2>Detalhes da tarefa</h2><p>Organize a entrega, responsabilidade e prazos.</p></div></div>
 <div className="project-form-grid">
  <div className="field project-wide"><label htmlFor="task-title">Título da tarefa *</label><input id="task-title" name="title" defaultValue={task?.title??''} minLength={3} maxLength={160} required placeholder="Ex.: Finalizar página de serviços"/></div>
  <div className="field"><label htmlFor="task-status">Etapa</label><select id="task-status" name="status" defaultValue={task?.status??'todo'}>{taskStatuses.map(([k,t])=><option key={k} value={k}>{t}</option>)}</select></div>
  <div className="field"><label htmlFor="task-priority">Prioridade</label><select id="task-priority" name="priority" defaultValue={task?.priority??'normal'}>{taskPriorities.map(([k,t])=><option key={k} value={k}>{t}</option>)}</select></div>
  <div className="field"><label htmlFor="task-owner">Responsável</label><select id="task-owner" name="assigned_to" defaultValue={task?.assigned_to??''}><option value="">Não atribuído</option>{members.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select></div>
  <div className="field"><label htmlFor="task-due">Prazo</label><input id="task-due" name="due_on" type="date" defaultValue={task?.due_on??''}/></div>
  <div className="field project-wide"><label htmlFor="task-project">Projeto vinculado</label><select id="task-project" name="project_id" defaultValue={task?.project_id??''}><option value="">Sem projeto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}{task?.project_id&&!projects.some(p=>p.id===task.project_id)?<option value={task.project_id}>{task.project_name??'Projeto arquivado'}</option>:null}</select></div>
  <div className="field project-wide"><label htmlFor="task-desc">Descrição</label><textarea id="task-desc" name="description" rows={5} maxLength={4000} defaultValue={task?.description??''} placeholder="O que deve ser entregue? Requisitos, anotações, links..."/></div>
 </div>
 {state.error?<p className="error-banner" role="alert">{state.error}</p>:null}
 <div className="project-form-actions"><Link href="/tarefas" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link><SaveButton/></div>
 </form>
}
