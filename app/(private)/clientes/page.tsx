import { UsersRound } from 'lucide-react'; import { ModulePlaceholder } from '@/components/module-placeholder'
export const metadata={title:'Clientes'}
export default function Page(){return <ModulePlaceholder title="Clientes & Contratos" description="Centralize relacionamentos, acordos e entregas." phase={5} icon={UsersRound} planned={['Cadastro de clientes','Projetos por cliente','Contratos e parcelas','Histórico comercial']}/>}
