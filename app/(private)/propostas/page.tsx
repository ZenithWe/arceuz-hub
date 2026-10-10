import Link from 'next/link'
import {FileText,Plus,Search,ArrowUpRight,UsersRound,CalendarDays,CheckCircle2,Clock3,Send,FolderKanban} from 'lucide-react'
import {listProposals,proposalFilters} from '@/lib/proposals'
import {proposalStatuses,proposalStatusName,formatProposalMoney,formatProposalDate} from '@/lib/proposal-fields.mjs'
import {changeProposalStatusAction} from './actions'
export const metadata={title:'Propostas'}
export const dynamic='force-dynamic'
export default async function ProposalsPage({searchParams}:{searchParams:Promise<{q?:string;status?:string;page?:string;excluida?:string;atualizada?:string;erro?:string}>}){
 const params=await searchParams,filters=proposalFilters(params)
 const result=await listProposals(filters)
 const {rows,total,metrics,perPage}=result
 const pages=Math.max(1,Math.ceil(total/perPage))
 const href=(page:number)=>'/propostas?'+new URLSearchParams({q:filters.q,status:filters.status,page:String(page)}).toString()
 return <div className="proposals-page">
  <div className="page-header"><div><div className="page-eyebrow">ARCEUZ HUB / GESTÃO COMERCIAL</div><h1>Propostas comerciais</h1><p>Crie orçamentos, acompanhe negociações e mantenha todas as propostas organizadas.</p></div><Link className="primary-button" href="/propostas/novo"><Plus size={16}/> Nova proposta</Link></div>
  {params.excluida==='1'?<p role="status" className="project-success">Proposta removida do Hub.</p>:null}
  {params.atualizada==='1'?<p role="status" className="project-success">Etapa atualizada com sucesso.</p>:null}
  {params.erro==='1'?<p role="alert" className="error-banner">Não foi possível atualizar a proposta.</p>:null}
  <div className="proposal-summary">
   <section className="panel proposal-stat"><FileText size={20}/><div><b>{metrics.total}</b><span>Total de propostas</span></div></section>
   <section className="panel proposal-stat"><Clock3 size={20}/><div><b>{metrics.inProgress}</b><span>Em acompanhamento</span></div></section>
   <section className="panel proposal-stat"><CheckCircle2 size={20}/><div><b>{metrics.accepted}</b><span>Aprovadas</span></div></section>
   <section className="panel proposal-stat"><Send size={20}/><div><b>{formatProposalMoney(metrics.acceptedAmount)}</b><span>Valor aprovado (não recebido)</span></div></section>
  </div>
  <form action="/propostas" method="GET" className="panel proposal-filters">
   <label className="project-search"><Search size={17}/><input name="q" type="search" defaultValue={filters.q} placeholder="Buscar título ou cliente" aria-label="Buscar propostas" maxLength={80}/></label>
   <select name="status" defaultValue={filters.status} aria-label="Filtrar por etapa"><option value="all">Todas as etapas</option>{proposalStatuses.map(([k,label])=><option key={k} value={k}>{label}</option>)}</select>
   <button type="submit" className="ghost-button">Filtrar</button>
  </form>
  {rows.length?<div className="proposal-grid">{rows.map(p=><article className="panel proposal-card" key={p.id}>
    <div className="proposal-card-top"><span className="proposal-document"><FileText size={21}/></span><span className={'proposal-pill proposal-pill-'+p.status}>{proposalStatusName(p.status)}</span></div>
    <Link href={'/propostas/'+p.id} className="proposal-card-title">{p.title}<ArrowUpRight size={16}/></Link>
    <p className="proposal-card-scope">{p.scope}</p>
    <div className="proposal-card-meta">
     <span><UsersRound size={14}/>{p.client_name??'Cliente não vinculado'}</span>
     {p.project_name?<span><FolderKanban size={14}/>{p.project_name}</span>:null}
     <span><CalendarDays size={14}/> Validade: {formatProposalDate(p.valid_until)}</span>
    </div>
    <strong className="proposal-card-value">{formatProposalMoney(p.amount_cents)}</strong>
    <form action={changeProposalStatusAction} className="proposal-status-form">
     <input type="hidden" name="id" value={p.id}/>
     <label htmlFor={'proposal-status-'+p.id}>Alterar etapa</label>
     <select id={'proposal-status-'+p.id} name="status" defaultValue={p.status}>{proposalStatuses.map(([k,label])=><option key={k} value={k}>{label}</option>)}</select>
     <button type="submit" className="ghost-button">OK</button>
    </form>
   </article>)}</div>:<section className="panel projects-empty"><FileText size={34}/><h2>{filters.q||filters.status!=='all'?'Nenhuma proposta encontrada':'Crie sua primeira proposta'}</h2><p>Cadastre escopo, valor, condições e cliente para acompanhar cada negociação.</p><Link href="/propostas/novo" className="primary-button"><Plus size={16}/> Nova proposta</Link></section>}
  {pages>1?<nav className="project-pagination" aria-label="Páginas de propostas"><span>Página {filters.page} de {pages}</span><div>{filters.page>1?<Link className="ghost-button" href={href(filters.page-1)}>Anterior</Link>:null}{filters.page<pages?<Link className="ghost-button" href={href(filters.page+1)}>Próxima</Link>:null}</div></nav>:null}
  <p className="proposal-note">Uma proposta aprovada não significa pagamento recebido. Recebimentos devem ser lançados separadamente no módulo Financeiro.</p>
 </div>
}
