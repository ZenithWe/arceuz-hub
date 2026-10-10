import Link from 'next/link'
import {ArrowLeft} from 'lucide-react'
import {financeProjects} from '@/lib/finance'
import {FinanceForm} from '@/components/finance-form'
export const metadata={title:'Novo lançamento'}
export default async function NewEntryPage(){
 const projects=await financeProjects()
 return <div><div className="page-header"><div><div className="page-eyebrow">FINANCEIRO / NOVO</div><h1>Novo lançamento</h1><p>Registre uma receita ou despesa na contabilidade interna.</p></div><Link className="ghost-button" href="/financeiro"><ArrowLeft size={16}/> Voltar</Link></div><FinanceForm projects={projects}/></div>
}
