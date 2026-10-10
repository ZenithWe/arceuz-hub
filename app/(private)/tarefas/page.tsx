import { ListTodo } from 'lucide-react'; import { ModulePlaceholder } from '@/components/module-placeholder'
export const metadata={title:'Tarefas'}
export default function Page(){return <ModulePlaceholder title="Tarefas" description="Acompanhe as próximas entregas de Mateus e Roberto." phase={5} icon={ListTodo} planned={['Responsável e prioridades','Prazos e notificações','Tarefas vinculadas a projetos','Listas de tarefas por status']}/>}
