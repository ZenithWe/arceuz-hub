import Link from 'next/link'
import {notFound} from 'next/navigation'
import {ArrowLeft,Printer} from 'lucide-react'
import {getProposal,proposalOptions} from '@/lib/proposals'
import {proposalStatusName} from '@/lib/proposal-fields.mjs'
import {ProposalForm} from '@/components/proposal-form'
import {DeleteRecordForm} from '@/components/delete-record-form'
import {deleteProposalAction} from '../actions'
export const metadata={title:'Editar proposta'}
export default async function ProposalDetail({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{criada?:string;salva?:string}>}){
 const [{id},flags,opts]=await Promise.all([params,searchParams,proposalOptions()])
 const proposal=await getProposal(id)
 if(!proposal)notFound()
 return <div className="proposal-detail-page">
  <div className="page-header"><div><div className="page-eyebrow">PROPOSTAS / EDIÇÃO</div><h1>{proposal.title}</h1><p>Etapa: {proposalStatusName(proposal.status)} · {proposal.client_name??'Cliente não vinculado'}</p></div><div className="proposal-head-actions"><Link href="/propostas" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link><Link href={'/propostas/'+id+'/imprimir'} className="primary-button"><Printer size={16}/> Imprimir / salvar PDF</Link></div></div>
  {flags.criada==='1'?<p className="project-success" role="status">Proposta cadastrada com sucesso.</p>:null}
  {flags.salva==='1'?<p className="project-success" role="status">Proposta atualizada com sucesso.</p>:null}
  <ProposalForm proposal={proposal} clients={opts.clients} projects={opts.projects}/>
  <DeleteRecordForm title="Excluir proposta" itemLabel={proposal.title} description="A proposta será removida permanentemente do Hub. Isso não exclui clientes, projetos ou documentos que você já tenha enviado." action={deleteProposalAction.bind(null,id)}/>
 </div>
}
