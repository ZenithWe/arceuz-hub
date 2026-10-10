'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Save,ArrowLeft } from 'lucide-react'
import { clientStatuses } from '@/lib/client-fields.mjs'
import type { ClientRow } from '@/lib/clients'
import { createClientAction,editClientAction } from '@/app/(private)/clientes/actions'

function Submit(){const {pending}=useFormStatus();return <button type="submit" className="primary-button" disabled={pending}><Save size={16}/>{pending?'Salvando...':'Salvar cliente'}</button>}
export function ClientForm({client}:{client?:ClientRow}){
 const action=client?editClientAction.bind(null,client.id):createClientAction
 const [state,formAction]=useActionState(action,{error:''})
 return <form action={formAction} className="panel project-editor">
 <div className="section-heading"><div><h2>Dados do cliente</h2><p>Centralize contatos e mantenha os dados comerciais organizados.</p></div></div>
 <div className="project-form-grid">
  <div className="field"><label htmlFor="client-name">Nome do cliente ou empresa *</label><input id="client-name" name="name" required minLength={2} maxLength={120} defaultValue={client?.name??''} placeholder="Ex.: Pizzaria Boa Massa"/></div>
  <div className="field"><label htmlFor="client-status">Etapa comercial</label><select id="client-status" name="status" defaultValue={client?.status??'lead'}>{clientStatuses.map(([key,label])=><option value={key} key={key}>{label}</option>)}</select></div>
  <div className="field"><label htmlFor="client-contact">Pessoa de contato</label><input id="client-contact" name="contact_name" maxLength={120} defaultValue={client?.contact_name??''} placeholder="Nome do responsável"/></div>
  <div className="field"><label htmlFor="client-email">E-mail</label><input id="client-email" name="email" type="email" maxLength={254} defaultValue={client?.email??''} placeholder="contato@empresa.com"/></div>
  <div className="field"><label htmlFor="client-phone">Telefone</label><input id="client-phone" name="phone" type="tel" maxLength={40} defaultValue={client?.phone??''} placeholder="(31) 3333-0000"/></div>
  <div className="field"><label htmlFor="client-whatsapp">WhatsApp</label><input id="client-whatsapp" name="whatsapp" type="tel" maxLength={40} defaultValue={client?.whatsapp??''} placeholder="(31) 99999-9999"/></div>
  <div className="field project-wide"><label htmlFor="client-website">Site (HTTPS)</label><input id="client-website" name="website" type="url" maxLength={500} defaultValue={client?.website??''} placeholder="https://empresa.com.br"/></div>
  <div className="field project-wide"><label htmlFor="client-notes">Observações</label><textarea id="client-notes" name="notes" maxLength={5000} rows={5} defaultValue={client?.notes??''} placeholder="Preferências, próximos passos, informações comerciais..."/></div>
 </div>
 {state.error&&<div role="alert" className="error-banner project-form-error">{state.error}</div>}
 <div className="project-form-actions"><Link className="ghost-button" href="/clientes"><ArrowLeft size={16}/> Voltar</Link><Submit/></div>
 </form>
}
