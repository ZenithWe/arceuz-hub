import Link from 'next/link'
import { ArrowLeft,GitBranch,Plus,ExternalLink } from 'lucide-react'
import { requireMember } from '@/lib/auth'
import { discoverPublicRepositories } from '@/lib/github-public'
import { quickRegisterRepositoryAction } from '../actions'
export const metadata={title:'Descobrir repositórios públicos'}
export const dynamic='force-dynamic'
export default async function DiscoverPage({searchParams}:{searchParams:Promise<{erro?:string}>}){
 await requireMember()
 const [{erro},repositories]=await Promise.all([searchParams,discoverPublicRepositories('ZenithWe')])
 return <div><div className="page-header"><div><div className="page-eyebrow">GITHUB / REPOSITÓRIOS PÚBLICOS</div><h1>Descobrir repositórios</h1><p>Projetos públicos da conta ZenithWe. Selecione os que deseja acompanhar.</p></div><Link href="/github" className="ghost-button"><ArrowLeft size={16}/> Voltar</Link></div>
 {erro==='1'?<p role="alert" className="error-banner">Não foi possível importar. O repositório talvez já esteja cadastrado; confira a listagem.</p>:null}
 {!repositories?<section className="panel projects-empty"><GitBranch size={30}/><h2>GitHub não respondeu agora</h2><p>A consulta pública pode estar temporariamente limitada. Você ainda pode adicionar qualquer repositório pelo link.</p><Link href="/github/novo" className="primary-button"><Plus size={15}/> Cadastro manual</Link></section>:
 <div className="repo-discover-grid">{repositories.map(r=><article className="panel repo-discover-card" key={r.full_name}><div className="repo-discover-head"><GitBranch size={20}/><h2>{r.full_name}</h2></div><p>{r.description||'Sem descrição pública.'}</p><div className="repo-discover-bottom"><span>{r.language||'Linguagem não informada'}</span><div><a href={'https://github.com/'+r.full_name} target="_blank" rel="noopener noreferrer" aria-label={'Abrir '+r.full_name}><ExternalLink size={15}/></a><form action={quickRegisterRepositoryAction}><input type="hidden" name="repository" value={r.full_name}/><button type="submit" className="ghost-button"><Plus size={14}/> Adicionar</button></form></div></div></article>)}</div>}
 <p className="repo-hint">Esta página lista até 60 repositórios públicos. Repositórios privados não são acessados por esta consulta.</p>
 </div>
}
