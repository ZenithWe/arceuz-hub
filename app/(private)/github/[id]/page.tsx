import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft,GitBranch,ExternalLink,RefreshCw,Star,Clock3,FolderKanban,ShieldCheck,Trash2 } from 'lucide-react'
import { getRepository,linkedProjects } from '@/lib/repositories'
import { formatRepositoryDate,repositorySyncLabel } from '@/lib/repository-fields.mjs'
import { RepositoryLinkForm } from '@/components/repository-link-form'
import { syncRepositoryAction,removeRepositoryAction } from '../actions'
export const metadata={title:'Detalhes do repositório'}
export const dynamic='force-dynamic'
export default async function RepositoryPage({params,searchParams}:{params:Promise<{id:string}>;searchParams:Promise<{criado?:string;salvo?:string;sincronizado?:string;indisponivel?:string;confirmar?:string}>}){
 const [{id},flags,projects]=await Promise.all([params,searchParams,linkedProjects()])
 const data=await getRepository(id)
 if(!data)notFound()
 return <div className="repo-detail-page">
  <div className="page-header"><div><div className="page-eyebrow">GITHUB / REPOSITÓRIO</div><h1>{data.github_full_name}</h1><p>Dados públicos e projeto vinculado ao código.</p></div><Link href="/github" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link></div>
  {flags.criado==='1'||flags.salvo==='1'||flags.sincronizado==='1'?<p role="status" className="project-success">{flags.criado==='1'?'Repositório adicionado ao Hub.':flags.salvo==='1'?'Projeto vinculado atualizado.':'Dados públicos atualizados.'}</p>:null}
  {flags.indisponivel==='1'?<p className="repo-notice" role="status">Consulta pública indisponível. O repositório pode ser privado, inexistente ou a API pode estar limitada.</p>:null}
  <div className="panel repo-detail-panel"><div className="repo-detail-header"><div className="repo-detail-title"><span className="repo-git-icon"><GitBranch size={24}/></span><div><h2>{data.github_full_name}</h2><span className={'repo-state repo-state-'+data.sync_status}>{repositorySyncLabel(data.sync_status)}</span></div></div><div className="repo-detail-actions"><a href={data.html_url} className="ghost-button" target="_blank" rel="noopener noreferrer"><ExternalLink size={16}/> Abrir no GitHub</a><form action={syncRepositoryAction}><input name="id" value={id} type="hidden"/><button type="submit" className="primary-button"><RefreshCw size={15}/> Atualizar dados</button></form></div></div>
  <p className="repo-detail-description">{data.description||'Nenhuma descrição pública disponível para este repositório.'}</p>
  <div className="repo-detail-stats"><div><span><Star size={15}/> Estrelas</span><b>{data.sync_status==='ok'?data.stars:'—'}</b></div><div><span><GitBranch size={15}/> Branch principal</span><b>{data.default_branch||'Não disponível'}</b></div><div><span>Linguagem</span><b>{data.language||'Não disponível'}</b></div><div><span><Clock3 size={15}/> Último commit público</span><b>{formatRepositoryDate(data.last_commit_at)}</b></div></div>
  <p className="repo-sync-info">Última consulta: {formatRepositoryDate(data.last_synced_at)} · Última atualização pública: {formatRepositoryDate(data.updated_at)}</p></div>
  <section className="panel repo-project-section"><div className="repo-section-heading"><FolderKanban size={20}/><div><h2>Projeto relacionado</h2><p>Associe este repositório a um trabalho existente no Hub.</p></div></div><RepositoryLinkForm id={id} projectId={data.project_id} projects={projects}/>{data.project_id?<Link href={'/projects/'+data.project_id} className="repo-project-link">Abrir projeto vinculado <ExternalLink size={14}/></Link>:null}</section>
  <section className="panel repo-danger-section"><div className="repo-section-heading"><ShieldCheck size={20}/><div><h2>Remover somente do Hub</h2><p>O repositório e os arquivos continuam intactos no GitHub.</p></div></div>{flags.confirmar==='1'?<p className="error-banner" role="alert">Digite REMOVER para confirmar.</p>:null}<form action={removeRepositoryAction.bind(null,id)} className="repo-remove-form"><label htmlFor="repo-remove-confirm">Digite REMOVER para desvincular o cadastro</label><div><input id="repo-remove-confirm" name="confirm" required autoComplete="off" placeholder="REMOVER" maxLength={20}/><button className="ghost-button repo-remove-button" type="submit"><Trash2 size={15}/> Remover cadastro</button></div></form></section>
 </div>
}
