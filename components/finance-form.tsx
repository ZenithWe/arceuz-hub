'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import {Save,ArrowLeft} from 'lucide-react'
import { directions,statuses,formatMoneyInput } from '@/lib/finance-fields.mjs'
import type {FinanceRow,FinanceProject} from '@/lib/finance'
import {createFinanceAction,editFinanceAction} from '@/app/(private)/financeiro/actions'

function SaveButton(){const {pending}=useFormStatus();return <button type="submit" className="primary-button" disabled={pending}><Save size={16}/>{pending?'Salvando...':'Salvar lançamento'}</button>}
export function FinanceForm({entry,projects}:{entry?:FinanceRow;projects:FinanceProject[]}){
 const action=entry?editFinanceAction.bind(null,entry.id):createFinanceAction
 const [state,formAction]=useActionState(action,{error:''})
 return <form action={formAction} className="panel project-editor">
 <div className="section-heading"><div><h2>Detalhes do lançamento</h2><p>Cadastro manual de receitas e despesas, sem cobrança automática.</p></div></div>
 <div className="project-form-grid">
  <div className="field project-wide"><label htmlFor="finance-title">Descrição do lançamento *</label><input id="finance-title" name="title" required minLength={3} maxLength={140} defaultValue={entry?.title??''} placeholder="Ex.: Desenvolvimento do site de cliente"/></div>
  <div className="field"><label htmlFor="finance-direction">Tipo *</label><select id="finance-direction" name="direction" defaultValue={entry?.direction??'income'}>{directions.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
  <div className="field"><label htmlFor="finance-amount">Valor em reais (R$) *</label><input id="finance-amount" name="amount" required inputMode="decimal" defaultValue={entry?formatMoneyInput(entry.amount_cents):''} placeholder="Ex.: 1.490,90"/></div>
  <div className="field"><label htmlFor="finance-status">Situação *</label><select id="finance-status" name="status" defaultValue={entry?.status??'pending'}>{statuses.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
  <div className="field"><label htmlFor="finance-category">Categoria</label><input id="finance-category" name="category" maxLength={90} defaultValue={entry?.category??''} placeholder="Ex.: Hospedagem, Site, Manutenção"/></div>
  <div className="field"><label htmlFor="finance-method">Forma de pagamento</label><input id="finance-method" name="method" maxLength={80} defaultValue={entry?.method??''} placeholder="Pix, transferência, cartão..."/></div>
  <div className="field"><label htmlFor="finance-reference">Referência interna (opcional, única)</label><input id="finance-reference" name="reference" maxLength={120} defaultValue={entry?.reference??''} placeholder="Ex.: NF-2026-001"/></div>
  <div className="field"><label htmlFor="finance-competence">Competência</label><input id="finance-competence" name="competence_on" type="date" defaultValue={entry?.competence_on??''}/></div>
  <div className="field"><label htmlFor="finance-due">Vencimento</label><input id="finance-due" name="due_on" type="date" defaultValue={entry?.due_on??''}/></div>
  <div className="field"><label htmlFor="finance-paid">Data de pagamento / recebimento</label><input id="finance-paid" name="paid_on" type="date" defaultValue={entry?.paid_on??''}/><small className="finance-field-hint">Obrigatória quando a situação for Concluído; mantenha vazia nos demais casos.</small></div>
  <div className="field project-wide"><label htmlFor="finance-project">Projeto relacionado</label><select id="finance-project" name="project_id" defaultValue={entry?.project_id??''}><option value="">Sem projeto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}{entry?.project_id&&!projects.some(p=>p.id===entry.project_id)?<option value={entry.project_id}>{entry.project_name??'Projeto arquivado'}</option>:null}</select></div>
  <div className="field project-wide"><label htmlFor="finance-notes">Observações internas</label><textarea id="finance-notes" name="notes" rows={5} maxLength={3000} defaultValue={entry?.notes??''} placeholder="Dados relevantes sobre o lançamento, sem incluir dados bancários confidenciais."/></div>
 </div>
 {state.error?<div role="alert" className="error-banner">{state.error}</div>:null}
 <p className="finance-disclaimer">Registrar um valor como concluído não confirma um pagamento no banco ou no gateway. Marque como concluído somente depois de verificar a transação.</p>
 <div className="project-form-actions"><Link href="/financeiro" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link><SaveButton/></div>
 </form>
}
