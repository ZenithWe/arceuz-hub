import Link from 'next/link'
import {notFound} from 'next/navigation'
import {ArrowLeft} from 'lucide-react'
import {financeProjects,getFinanceEntry} from '@/lib/finance'
import {FinanceForm} from '@/components/finance-form'
import {DeleteRecordForm} from '@/components/delete-record-form'
import {deleteFinanceAction} from '../actions'
export const metadata={title:'Editar lançamento'}
export default async function FinanceDetail({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{criado?:string;salvo?:string}>}){
 const [{id},flags,projects]=await Promise.all([params,searchParams,financeProjects()])
 const entry=await getFinanceEntry(id)
 if(!entry)notFound()
 return <div><div className="page-header"><div><div className="page-eyebrow">FINANCEIRO / EDITAR</div><h1>{entry.title}</h1><p>Altere os detalhes, o vencimento e a situação do lançamento.</p></div><Link href="/financeiro" className="ghost-button"><ArrowLeft size={16}/> Financeiro</Link></div>
 {flags.criado==='1'||flags.salvo==='1'?<p className="project-success" role="status">{flags.criado==='1'?'Lançamento criado com sucesso.':'Lançamento atualizado com sucesso.'}</p>:null}
 <FinanceForm entry={entry} projects={projects}/>
 <div className="finance-history panel"><b>Registro interno</b><span>Cadastrado por: {entry.created_by_name??'Não informado'} · Última edição: {entry.updated_by_name??'Não informado'}</span></div>
 <DeleteRecordForm title="Excluir lançamento financeiro" itemLabel={entry.title} description="Remove este lançamento e seu valor dos indicadores do Hub. Não cancela cobranças, transferências ou pagamentos em serviços externos." action={deleteFinanceAction.bind(null,id)}/>
 </div>
}
