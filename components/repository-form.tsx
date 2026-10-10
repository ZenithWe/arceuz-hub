'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import Link from 'next/link'
import { Save, ArrowLeft } from 'lucide-react'
import type { LinkedProject } from '@/lib/repositories'
import { createRepositoryAction } from '@/app/(private)/github/actions'
function Submit(){const {pending}=useFormStatus();return <button disabled={pending} type="submit" className="primary-button"><Save size={16}/>{pending?'Cadastrando...':'Cadastrar repositório'}</button>}
export function RepositoryForm({projects}:{projects:LinkedProject[]}){
 const [state,action]=useActionState(createRepositoryAction,{error:''})
 return <form action={action} className="panel project-editor">
  <div className="section-heading"><div><h2>Adicionar repositório</h2><p>Cole o endereço de um repositório da equipe. Não informe senhas nem tokens.</p></div></div>
  <div className="project-form-grid">
   <div className="field project-wide"><label htmlFor="repo-link">Link ou nome completo *</label><input id="repo-link" name="repository" required maxLength={300} placeholder="https://github.com/ZenithWe/nome-do-repositorio"/></div>
   <div className="field project-wide"><label htmlFor="repo-project">Vincular a um projeto do Hub (opcional)</label><select id="repo-project" name="project_id" defaultValue=""><option value="">Sem projeto</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
  </div>
  {state.error?<p role="alert" className="error-banner">{state.error}</p>:null}
  <p className="repo-hint">A consulta de metadados é automática apenas para repositórios públicos. Privados ficam registrados, mas exigem autorização GitHub separada para mostrar commits.</p>
  <div className="project-form-actions"><Link href="/github" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link><Submit/></div>
 </form>
}
