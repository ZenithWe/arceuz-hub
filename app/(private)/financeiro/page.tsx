import { Wallet } from 'lucide-react'; import { ModulePlaceholder } from '@/components/module-placeholder'
export const metadata={title:'Financeiro'}
export default function Page(){return <ModulePlaceholder title="Financeiro" description="Receitas, despesas e fluxo de caixa da Arceuz." phase={4} icon={Wallet} planned={['Receitas e despesas','Pagamentos e pendências','Relatórios e exportação','Categorização e vínculos com projetos']}/>}
