import Link from 'next/link'
import { UsersRound,Plus,Search,ArrowUpRight,FolderKanban,Mail,Phone } from 'lucide-react'
import { listClients,resolveClientFilters } from '@/lib/clients'
import { clientStatuses,clientStatusName } from '@/lib/client-fields.mjs'
export const metadata={title:'Clientes'}
export default async function ClientsPage({searchParams}:{searchParams:Promise<{q?:string;status?:string;page?:string}>}){
 const q=resolveClientFilters(await searchParams)
 const {rows,total,perPage}=await listClients(q)
 const pages=Math.max(1,Math.ceil(total/perPage))
 const pageLink=(p:number)=>`/clientes?${new URLSearchParams({q:q.q,status:q.status,page:String(p)}).toString()}`
 return <div className="client-list-page">
 <div className="page-header"><div><div className="page-eyebrow">ARCEUZ HUB · MÓDULO CLIENTES</div><h1>Clientes</h1><p>Seu relacionamento comercial e todos os projetos de cada cliente, num só lugar.</p></div><Link className="primary-button" href="/clientes/novo"><Plus size={16}/> Novo cliente</Link></div>
 <div className="project-counts"><div className="panel project-count"><UsersRound size={20}/><div><b>{total}</b><span>Clientes encontrados</span></div></div><div className="panel project-count"><FolderKanban size={20}/><div><b>{rows.reduce((sum,c)=>sum+Number(c.project_count),0)}</b><span>Projetos vinculados nesta página</span></div></div></div>
 <form method="GET" action="/clientes" className="panel project-filters"><label className="project-search"><Search size={17}/><input type="search" name="q" aria-label="Pesquisar clientes" maxLength={80} defaultValue={q.q} placeholder="Buscar nome, contato ou e-mail"/></label><select name="status" aria-label="Filtrar etapa" defaultValue={q.status}><option value="all">Todas as etapas</option>{clientStatuses.map(([key,label])=><option key={key} value={key}>{label}</option>)}</select><button className="ghost-button" type="submit">Filtrar</button></form>
 {rows.length?<div className="client-card-grid">{rows.map(c=><article className="panel client-card" key={c.id}><div className="client-card-top"><span className="client-monogram">{c.name.trim().slice(0,1).toUpperCase()}</span><span className={`client-status client-${c.status}`}>{clientStatusName(c.status)}</span></div><Link href={`/clientes/${c.id}`} className="client-name">{c.name}<ArrowUpRight size={18}/></Link><p className="client-contact">{c.contact_name||'Sem responsável informado'}</p><div className="client-information">{c.email?<span><Mail size={15}/>{c.email}</span>:null}{c.phone?<span><Phone size={15}/>{c.phone}</span>:null}</div><div className="client-card-bottom"><span><FolderKanban size={15}/> {Number(c.project_count)} projeto(s)</span><Link href={`/clientes/${c.id}`}>Ver cadastro <ArrowUpRight size={15}/></Link></div></article>)}</div>:<section className="panel projects-empty"><UsersRound size={34}/><h2>{q.q||q.status!=='all'?'Nenhum cliente encontrado':'Cadastre seu primeiro cliente'}</h2><p>{q.q||q.status!=='all'?'Altere os filtros para pesquisar novamente.':'Os dados de contato e projetos vinculados aparecerão aqui.'}</p><Link href="/clientes/novo" className="primary-button"><Plus size={16}/> Novo cliente</Link></section>}
 {pages>1&&<nav className="project-pagination" aria-label="Paginação de clientes"><span>Página {q.page} de {pages}</span><div>{q.page>1&&<Link className="ghost-button" href={pageLink(q.page-1)}>Anterior</Link>}{q.page<pages&&<Link className="ghost-button" href={pageLink(q.page+1)}>Próxima</Link>}</div></nav>}
 </div>
}
