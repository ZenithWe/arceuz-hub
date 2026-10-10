import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft,ExternalLink,Archive } from 'lucide-react'
import { getProject,listOwners } from '@/lib/projects'
import { statusName } from '@/lib/project-fields.mjs'
import { ProjectForm } from '@/components/project-form'
import { archiveProjectAction,deleteProjectAction } from '../actions'
import { DeleteRecordForm } from '@/components/delete-record-form'
export const metadata={title:'Editar projeto'}
export default async function ProjectPage({params,searchParams}:{params:Promise<{id:string}>,searchParams:Promise<{salvo?:string;criado?:string}>}){
  const {id}=await params
  const [project,owners,flags]=await Promise.all([getProject(id),listOwners(),searchParams])
  if(!project)notFound()
  return <div><div className="page-header"><div><div className="page-eyebrow">PROJETOS & SITES / EDITAR</div><h1>{project.name}</h1><p><span className={`project-status status-${project.status}`}>{statusName(project.status)}</span> {project.client_name&&`· ${project.client_name}`}</p></div><Link href="/projects" className="ghost-button"><ArrowLeft size={15}/> Lista de projetos</Link></div>
    {(flags.salvo==='1'||flags.criado==='1')&&<div role="status" className="project-success">Projeto {flags.criado==='1'?'cadastrado':'atualizado'} com sucesso.</div>}
    <div className="project-detail-links">{project.production_url&&<a className="ghost-button" href={project.production_url} target="_blank" rel="noopener noreferrer">Site em produção <ExternalLink size={15}/></a>}{project.demo_url&&<a className="ghost-button" href={project.demo_url} target="_blank" rel="noopener noreferrer">Demonstração <ExternalLink size={15}/></a>}{project.repository_url&&<a className="ghost-button" href={project.repository_url} target="_blank" rel="noopener noreferrer">GitHub <ExternalLink size={15}/></a>}</div>
    <ProjectForm project={project} owners={owners}/>
    {project.status!=='archived'&&<section className="panel project-archive"><div><h2>Arquivar projeto</h2><p>Mantém as informações e o histórico do projeto, retirando-o do fluxo ativo.</p></div><form action={archiveProjectAction}><input type="hidden" name="id" value={project.id}/><button type="submit" className="ghost-button"><Archive size={15}/> Arquivar</button></form></section>}
    <DeleteRecordForm title="Excluir projeto ou site" itemLabel={project.name} description="Exclui este cadastro do Hub, sem apagar o site hospedado nem o repositório original do GitHub. Tarefas, repositórios e lançamentos financeiros relacionados são preservados, mas desvinculados." action={deleteProjectAction.bind(null,id)}/>
  </div>
}
