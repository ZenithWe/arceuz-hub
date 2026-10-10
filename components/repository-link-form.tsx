'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Save } from 'lucide-react'
import { linkRepositoryProjectAction } from '@/app/(private)/github/actions'
import type { LinkedProject } from '@/lib/repositories'
function SaveButton(){const {pending}=useFormStatus();return <button disabled={pending} className="primary-button" type="submit"><Save size={15}/>{pending?'Salvando...':'Salvar vínculo'}</button>}
export function RepositoryLinkForm({id,projectId,projects}:{id:string;projectId:string|null;projects:LinkedProject[]}){
 const [state,action]=useActionState(linkRepositoryProjectAction.bind(null,id),{error:''})
 return <form action={action} className="repo-link-form"><label htmlFor="repo-associated-project">Projeto do Arceuz Hub</label><div><select id="repo-associated-project" name="project_id" defaultValue={projectId??''}><option value="">Sem projeto vinculado</option>{projects.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}{projectId&&!projects.some(p=>p.id===projectId)?<option value={projectId}>Projeto arquivado</option>:null}</select><SaveButton/></div>{state.error?<p className="error-banner" role="alert">{state.error}</p>:null}</form>
}
