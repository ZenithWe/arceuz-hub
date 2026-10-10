import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { getTask,taskOptions } from '@/lib/tasks'
import { TaskForm } from '@/components/task-form'
export const metadata={title:'Editar tarefa'}
export default async function Page({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{salvo?:string}>}){
 const [{id},flags,options]=await Promise.all([params,searchParams,taskOptions()])
 const task=await getTask(id)
 if(!task)notFound()
 return <div><div className="page-header"><div><div className="page-eyebrow">TAREFAS / EDITAR</div><h1>Editar tarefa</h1><p>Atualize a entrega, o prazo e a pessoa responsável.</p></div><Link href="/tarefas" className="ghost-button"><ArrowLeft size={16}/> Tarefas</Link></div>
 {flags.salvo==='1'?<p role="status" className="project-success">Tarefa atualizada com sucesso.</p>:null}
 <TaskForm task={task} members={options.members} projects={options.projects}/></div>
}
