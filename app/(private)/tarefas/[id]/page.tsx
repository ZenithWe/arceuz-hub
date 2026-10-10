
import Link from 'next/link'
import {ArrowLeft,FolderKanban,CalendarClock} from 'lucide-react'
import {notFound} from 'next/navigation'
import {getTask,taskOptions} from '@/lib/tasks'
import {TaskForm} from '@/components/task-form'
import {brDate} from '@/lib/task-fields.mjs'
export const metadata={title:'Editar tarefa'}
export default async function EditTask({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{criada?:string;salva?:string}>}){
 const {id}=await params
 const [task,opts,flags]=await Promise.all([getTask(id),taskOptions(),searchParams])
 if(!task)notFound()
 return <div><div className="page-header"><div><div className="page-eyebrow">TAREFAS / EDIÇÃO</div><h1>{task.title}</h1><p>Atualize as informações e acompanhe o andamento da entrega.</p></div><Link href="/tarefas" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link></div>
 {(flags.criada==='1'||flags.salva==='1')&&<p className="project-success" role="status">{flags.criada==='1'?'Tarefa criada.':'Tarefa atualizada.'}</p>}
 <TaskForm task={task} owners={opts.owners} projects={opts.projects}/>
 <section className="panel task-detail-extra"><div><FolderKanban size={18}/><span>Projeto</span><strong>{task.project_name||'Sem vínculo'}</strong></div><div><CalendarClock size={18}/><span>Data prevista</span><strong>{brDate(task.due_on)}</strong></div></section>
 </div>
}
