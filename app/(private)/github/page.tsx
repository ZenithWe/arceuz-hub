import { GitBranch } from 'lucide-react'; import { ModulePlaceholder } from '@/components/module-placeholder'
export const metadata={title:'Repositórios'}
export default function Page(){return <ModulePlaceholder title="Repositórios" description="Acompanhe repositórios GitHub associados à Arceuz." phase={3} icon={GitBranch} planned={['Autorização oficial do GitHub','Seleção de repositórios','Commits, issues e pull requests','Estado de conexão e atividade recente']}/>}
