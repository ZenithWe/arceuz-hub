import Link from 'next/link'
import {ArrowLeft} from 'lucide-react'
import {proposalOptions} from '@/lib/proposals'
import {ProposalForm} from '@/components/proposal-form'
export const metadata={title:'Nova proposta'}
export default async function NewProposal(){
 const {clients,projects}=await proposalOptions()
 return <div><div className="page-header"><div><div className="page-eyebrow">PROPOSTAS / NOVA</div><h1>Nova proposta</h1><p>Crie um orçamento profissional e pronto para enviar.</p></div><Link className="ghost-button" href="/propostas"><ArrowLeft size={16}/> Voltar</Link></div><ProposalForm clients={clients} projects={projects}/></div>
}
