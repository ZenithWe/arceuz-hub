import Link from 'next/link'
import {notFound} from 'next/navigation'
import {ArrowLeft,ShieldCheck} from 'lucide-react'
import {getProposal} from '@/lib/proposals'
import {formatProposalDate,formatProposalMoney} from '@/lib/proposal-fields.mjs'
import {ProposalPrintButton} from '@/components/proposal-print-button'
export const metadata={title:'Proposta para impressão'}
export const dynamic='force-dynamic'
export default async function ProposalPrint({params}:{params:Promise<{id:string}>}){
 const {id}=await params
 const p=await getProposal(id)
 if(!p)notFound()
 return <div className="proposal-print-page">
  <div className="proposal-print-tools"><Link href={'/propostas/'+id} className="ghost-button"><ArrowLeft size={16}/> Voltar à edição</Link><ProposalPrintButton/></div>
  <article className="proposal-paper">
   <header className="proposal-paper-head"><div><b className="proposal-brand">ARCEUZ<span>®</span></b><span className="proposal-brand-sub">TECHNOLOGY & DIGITAL SOLUTIONS</span></div><strong>PROPOSTA COMERCIAL</strong></header>
   <div className="proposal-paper-intro"><p>PROPOSTA DE SERVIÇOS</p><h1>{p.title}</h1><p>Preparada para: <strong>{p.client_name??'Cliente a definir'}</strong></p>{p.project_name?<p>Projeto: {p.project_name}</p>:null}</div>
   <div className="proposal-paper-grid"><div><span>DATA DE EMISSÃO</span><b>{formatProposalDate(p.created_at.slice(0,10))}</b></div><div><span>VÁLIDA ATÉ</span><b>{formatProposalDate(p.valid_until)}</b></div><div><span>VALOR DA PROPOSTA</span><b>{formatProposalMoney(p.amount_cents)}</b></div></div>
   <section><h2>01. Escopo da proposta</h2><p>{p.scope}</p></section>
   {p.delivery_terms?<section><h2>02. Entrega e cronograma</h2><p>{p.delivery_terms}</p></section>:null}
   {p.payment_terms?<section><h2>03. Condições de pagamento</h2><p>{p.payment_terms}</p></section>:null}
   <div className="proposal-paper-total"><span>Investimento total</span><strong>{formatProposalMoney(p.amount_cents)}</strong></div>
   <div className="proposal-paper-signatures"><div><span>_________________________________________</span><p>ARCEUZ TECHNOLOGY</p></div><div><span>_________________________________________</span><p>ACEITE DO CLIENTE</p></div></div>
   <footer>ARCEUZ TECHNOLOGY · Proposta comercial preparada para apreciação do cliente</footer>
  </article>
  <p className="proposal-note proposal-print-note"><ShieldCheck size={15}/> A versão para impressão não mostra observações internas. Esta página exige login; use Imprimir e selecione “Salvar como PDF” para gerar o arquivo.</p>
 </div>
}
