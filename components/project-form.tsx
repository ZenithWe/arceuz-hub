'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Save,ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { statuses,formatBRLInput } from '@/lib/project-fields.mjs'
import type { HubProject,Owner } from '@/lib/projects'
import { createProjectAction,editProjectAction } from '@/app/(private)/projects/actions'
function SaveButton(){const {pending}=useFormStatus();return <button className="primary-button" type="submit" disabled={pending}><Save size={16}/>{pending?'Salvando...':'Salvar projeto'}</button>}
export function ProjectForm({project,owners}:{project?:HubProject;owners:Owner[]}){
  const action=project?editProjectAction.bind(null,project.id):createProjectAction
  const [state,formAction]=useActionState(action,{error:''})
  return <form action={formAction} className="project-editor panel">
    <div className="section-heading"><div><h2>Informações do projeto</h2><p>Preencha o que souber agora; atualize o restante quando necessário.</p></div></div>
    <div className="project-form-grid">
      <div className="field project-wide"><label htmlFor="project-name">Nome do projeto *</label><input id="project-name" name="name" defaultValue={project?.name??''} maxLength={110} minLength={2} required placeholder="Ex.: Website institucional — Loja X"/></div>
      <div className="field"><label htmlFor="project-client">Cliente</label><input id="project-client" name="client_name" defaultValue={project?.client_name??''} maxLength={160} placeholder="Nome da empresa ou cliente"/></div>
      <div className="field"><label htmlFor="project-category">Categoria</label><input id="project-category" name="category" defaultValue={project?.category??''} maxLength={100} placeholder="Site, SaaS, e-commerce..."/></div>
      <div className="field"><label htmlFor="project-status">Status</label><select id="project-status" name="status" defaultValue={project?.status??'idea'}>{statuses.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select></div>
      <div className="field"><label htmlFor="project-owner">Responsável</label><select id="project-owner" name="responsible_id" defaultValue={project?.responsible_id??''}><option value="">Não atribuído</option>{owners.map(person=><option key={person.id} value={person.id}>{person.name}</option>)}</select></div>
      <div className="field project-wide"><label htmlFor="project-description">Descrição</label><textarea id="project-description" name="description" rows={3} maxLength={2000} defaultValue={project?.description??''} placeholder="Objetivo, escopo e entregas principais"/></div>
      <div className="field"><label htmlFor="project-tech">Tecnologias</label><input id="project-tech" name="technology" maxLength={160} defaultValue={project?.technology??''} placeholder="Next.js, PostgreSQL..."/></div>
      <div className="field"><label htmlFor="project-revenue">Valor previsto (R$)</label><input id="project-revenue" name="expected_revenue" inputMode="decimal" defaultValue={formatBRLInput(project?.expected_revenue_cents??'0')} placeholder="0,00"/></div>
      <div className="field"><label htmlFor="project-start">Início</label><input id="project-start" name="started_on" type="date" defaultValue={project?.started_on??''}/></div>
      <div className="field"><label htmlFor="project-due">Previsão de entrega</label><input id="project-due" name="due_on" type="date" defaultValue={project?.due_on??''}/></div>
      <div className="field project-wide"><label htmlFor="project-url">URL publicada (HTTPS)</label><input id="project-url" name="production_url" type="url" defaultValue={project?.production_url??''} maxLength={500} placeholder="https://exemplo.com"/></div>
      <div className="field"><label htmlFor="project-demo">URL de demonstração</label><input id="project-demo" name="demo_url" type="url" defaultValue={project?.demo_url??''} maxLength={500} placeholder="https://preview.exemplo.com"/></div>
      <div className="field"><label htmlFor="project-repo">Repositório</label><input id="project-repo" name="repository_url" type="url" defaultValue={project?.repository_url??''} maxLength={500} placeholder="https://github.com/..."/></div>
      <div className="field project-wide"><label htmlFor="project-notes">Anotações internas</label><textarea id="project-notes" name="notes" rows={4} maxLength={5000} defaultValue={project?.notes??''} placeholder="Prazos, decisões e próximos passos"/></div>
    </div>
    {state.error&&<p role="alert" className="form-error project-form-error">{state.error}</p>}
    <div className="project-form-actions"><Link href="/projects" className="ghost-button"><ArrowLeft size={15}/> Voltar</Link><SaveButton/></div>
  </form>
}
