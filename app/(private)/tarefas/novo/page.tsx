import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { taskOptions } from '@/lib/tasks'
import { TaskForm } from '@/components/task-form'
export const metadata={title:'Nova tarefa'}
export default async function Page(){
 const {members,projects}=await taskOptions()
 return <div><div className="page-header"><div><div className="page-eyebrow">TAREFAS / NOVA</div><h1>Nova tarefa</h1><p>Registre uma entrega e atribua a alguém da equipe.</p></div><Link href="/tarefas" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link></div><TaskForm members={members} projects={projects}/></div>
}
