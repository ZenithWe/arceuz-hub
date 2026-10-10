
import Link from 'next/link'
import {ArrowLeft} from 'lucide-react'
import {TaskForm} from '@/components/task-form'
import {taskOptions} from '@/lib/tasks'
export const metadata={title:'Nova tarefa'}
export default async function NewTask(){
 const {owners,projects}=await taskOptions()
 return <div><div className="page-header"><div><div className="page-eyebrow">TAREFAS / NOVA</div><h1>Nova tarefa</h1><p>Crie uma entrega para Mateus ou Roberto e acompanhe seu prazo.</p></div><Link href="/tarefas" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link></div><TaskForm owners={owners} projects={projects}/></div>
}
