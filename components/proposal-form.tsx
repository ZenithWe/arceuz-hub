'use client'
import {useActionState} from 'react'
import {useFormStatus} from 'react-dom'
import Link from 'next/link'
import {ArrowLeft,Save} from 'lucide-react'
import {proposalStatuses,proposalInputMoney} from '@/lib/proposal-fields.mjs'
import type {ProposalRow,ProposalOption} from '@/lib/proposals'
import {createProposalAction,editProposalAction} from '@/app/(private)/propostas/actions'
function Submit(){const {pending}=useFormStatus();return <button type="submit" className="primary-button" disabled={pending}><Save size={16}/>{pending?'Salvando...':'Salvar proposta'}</button>}
export function ProposalForm({proposal,clients,projects}:{proposal?:ProposalRow;clients:ProposalOption[];projects:ProposalOption[]}){
 const action=proposal?editProposalAction.bind(null,proposal.id):createProposalAction
 const [state,submit]=useActionState(action,{error:''})
 return <form action={submit} className="panel project-editor">
 <div className="section-heading"><div><h2>Dados da proposta</h2><p>Descreva exatamente o que será entregue, o valor e as condições comerciais.</p></div></div>
 <div className="project-form-grid">
 <div className="field project-wide"><label htmlFor="proposal-title">Título *</label><input id="proposal-title" name="title" required minLength={3} maxLength={150} defaultValue={proposal?.title??''} placeholder="Ex.: Desenvolvimento de site profissional"/></div>
 <div className="field"><label htmlFor="proposal-client">Cliente</label><select id="proposal-client" name="client_id" defaultValue={proposal?.client_id??''}><option value="">Sem cliente vinculado</option>{clients.map(c=><option value={c.id} key={c.id}>{c.name}</option>)}</select></div>
 <div className="field"><label htmlFor="proposal-project">Projeto</label><select id="proposal-project" name="project_id" defaultValue={proposal?.project_id??''}><option value="">Sem projeto vinculado</option>{projects.map(p=><option value={p.id} key={p.id}>{p.name}</option>)}{proposal?.project_id&&!projects.some(p=>p.id===proposal.project_id)?<option value={proposal.project_id}>Projeto arquivado</option>:null}</select></div>
 <div className="field"><label htmlFor="proposal-value">Valor total (R$) *</label><input id="proposal-value" name="amount" required inputMode="decimal" defaultValue={proposal?proposalInputMoney(proposal.amount_cents):''} placeholder="2.490,00"/></div>
 <div className="field"><label htmlFor="proposal-status">Etapa *</label><select id="proposal-status" name="status" defaultValue={proposal?.status??'draft'}>{proposalStatuses.map(([id,title])=><option key={id} value={id}>{title}</option>)}</select></div>
 <div className="field"><label htmlFor="proposal-valid">Validade</label><input id="proposal-valid" type="date" name="valid_until" defaultValue={proposal?.valid_until??''}/></div>
 <div className="field project-wide"><label htmlFor="proposal-scope">Escopo do trabalho *</label><textarea required id="proposal-scope" name="scope" rows={7} minLength={10} maxLength={8000} defaultValue={proposal?.scope??''} placeholder="Descreva serviços, funcionalidades, páginas, entregáveis e o que está incluído."/></div>
 <div className="field project-wide"><label htmlFor="proposal-delivery">Prazo e condições de entrega</label><textarea id="proposal-delivery" name="delivery_terms" rows={3} maxLength={2500} defaultValue={proposal?.delivery_terms??''} placeholder="Ex.: Até 20 dias úteis após envio do material e aprovação do layout."/></div>
 <div className="field project-wide"><label htmlFor="proposal-payments">Condições de pagamento</label><textarea id="proposal-payments" name="payment_terms" rows={3} maxLength={2500} defaultValue={proposal?.payment_terms??''} placeholder="Ex.: 50% no início e 50% na conclusão."/></div>
 <div className="field project-wide"><label htmlFor="proposal-notes">Observações internas (não aparecem na impressão)</label><textarea id="proposal-notes" name="notes" rows={3} maxLength={3000} defaultValue={proposal?.notes??''}/></div>
 </div>
 {state.error?<p className="error-banner" role="alert">{state.error}</p>:null}
 <div className="project-form-actions"><Link className="ghost-button" href="/propostas"><ArrowLeft size={16}/> Voltar</Link><Submit/></div>
 </form>
}
