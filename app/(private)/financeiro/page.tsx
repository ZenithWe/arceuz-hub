import Link from 'next/link'
import { Wallet,Plus,Search,ArrowUpRight,TrendingUp,TrendingDown,Clock3,AlertTriangle,CalendarDays,FolderKanban,ReceiptText,CheckCircle2,Undo2,XCircle } from 'lucide-react'
import { listFinances,parseFinanceFilters } from '@/lib/finance'
import { directions,statuses,formatMoney,formatDate,isPastDue } from '@/lib/finance-fields.mjs'
import { changeFinanceStatusAction } from './actions'

export const metadata={title:'Financeiro'}
export const dynamic='force-dynamic'
type Search={q?:string;direction?:string;status?:string;month?:string;page?:string;alterado?:string;erro?:string}

export default async function FinancePage({searchParams}:{searchParams:Promise<Search>}){
 const params=await searchParams
 const filters=parseFinanceFilters(params)
 const {rows,total,perPage,summary}=await listFinances(filters)
 const pages=Math.max(1,Math.ceil(total/perPage))
 const urlFor=(page:number)=>'/financeiro?'+new URLSearchParams({q:filters.q,direction:filters.direction,status:filters.status,month:filters.month==='all'?'':filters.month,page:String(page)}).toString()
 const today=new Intl.DateTimeFormat('sv-SE',{timeZone:'America/Sao_Paulo',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())
 const net=summary.received-summary.spent
 return <div className="finance-page">
 <div className="page-header"><div><div className="page-eyebrow">ARCEUZ HUB / CONTROLE INTERNO</div><h1>Financeiro</h1><p>Receitas, despesas, vencimentos e pagamentos organizados por projeto.</p></div><Link href="/financeiro/novo" className="primary-button"><Plus size={16}/> Novo lançamento</Link></div>
 {params.alterado==='1'?<p className="project-success" role="status">Situação atualizada com sucesso.</p>:null}
 {params.erro==='1'?<p className="error-banner" role="alert">Não foi possível atualizar o lançamento.</p>:null}
 <p className="finance-period"><CalendarDays size={15}/> Resumo {filters.month==='all'?'de todo o período':'de '+filters.month.split('-').reverse().join('/')} · Apenas valores concluídos compõem o saldo realizado.</p>
 <div className="finance-kpis">
  <section className="panel finance-kpi"><span><TrendingUp size={17}/> Receitas recebidas</span><b className="fin-positive">{formatMoney(summary.received)}</b><small>Receitas concluídas</small></section>
  <section className="panel finance-kpi"><span><TrendingDown size={17}/> Despesas pagas</span><b className="fin-negative">{formatMoney(summary.spent)}</b><small>Despesas concluídas</small></section>
  <section className="panel finance-kpi"><span><Wallet size={17}/> Saldo realizado</span><b className={net>=0?'fin-positive':'fin-negative'}>{formatMoney(net)}</b><small>Recebido menos pago</small></section>
  <section className="panel finance-kpi"><span><Clock3 size={17}/> A receber</span><b>{formatMoney(summary.receivable)}</b><small>Receitas pendentes</small></section>
  <section className="panel finance-kpi"><span><AlertTriangle size={17}/> A pagar</span><b>{formatMoney(summary.payable)}</b><small>{summary.overdue} lançamento(s) vencido(s)</small></section>
 </div>
 <form className="panel finance-filters" method="GET" action="/financeiro">
  <label className="project-search"><Search size={17}/><input type="search" name="q" maxLength={80} aria-label="Buscar lançamentos" defaultValue={filters.q} placeholder="Buscar descrição, categoria ou projeto"/></label>
  <select aria-label="Filtrar tipo" name="direction" defaultValue={filters.direction}><option value="all">Receitas e despesas</option>{directions.map(([k,n])=><option key={k} value={k}>{n}</option>)}</select>
  <select aria-label="Filtrar situação" name="status" defaultValue={filters.status}><option value="all">Todas as situações</option>{statuses.map(([k,n])=><option key={k} value={k}>{n}</option>)}</select>
  <label className="finance-month-filter">Mês <input type="month" name="month" defaultValue={filters.month==='all'?'':filters.month}/></label>
  <button className="ghost-button" type="submit">Filtrar</button><Link href="/financeiro" className="finance-clear">Limpar</Link>
 </form>
 <div className="finance-list-heading"><h2>Lançamentos</h2><span>{total} registro(s)</span></div>
 {rows.length?<div className="finance-items">{rows.map(entry=><article className="panel finance-item" key={entry.id}>
  <div className="finance-item-icon">{entry.direction==='income'?<TrendingUp size={21}/>:<TrendingDown size={21}/>}</div>
  <div className="finance-item-main">
   <div className="finance-item-tags"><span className={'finance-tag finance-tag-'+entry.direction}>{entry.direction==='income'?'Receita':'Despesa'}</span><span className={'finance-tag finance-tag-'+entry.status}>{entry.status==='paid'?'Concluído':entry.status==='cancelled'?'Cancelado':'Pendente'}</span>{isPastDue(entry,today)?<span className="finance-tag finance-tag-late">Vencido</span>:null}</div>
   <Link href={'/financeiro/'+entry.id} className="finance-item-title">{entry.title}<ArrowUpRight size={15}/></Link>
   <div className="finance-item-meta"><span><FolderKanban size={14}/>{entry.project_name??'Sem projeto'}</span><span><CalendarDays size={14}/> Vencimento: {formatDate(entry.due_on)}</span>{entry.category?<span><ReceiptText size={14}/>{entry.category}</span>:null}</div>
  </div>
  <div className="finance-item-right"><b className={entry.direction==='income'?'fin-positive':'fin-negative'}>{entry.direction==='income'?'+ ':'− '}{formatMoney(entry.amount_cents)}</b><div className="finance-item-actions">
  {entry.status==='pending'?<><form action={changeFinanceStatusAction}><input type="hidden" name="id" value={entry.id}/><input type="hidden" name="status" value="paid"/><button className="fin-mini fin-done" type="submit"><CheckCircle2 size={14}/> Concluir</button></form><form action={changeFinanceStatusAction}><input type="hidden" name="id" value={entry.id}/><input type="hidden" name="status" value="cancelled"/><button className="fin-mini fin-cancel" type="submit"><XCircle size={14}/> Cancelar</button></form></>:<form action={changeFinanceStatusAction}><input type="hidden" name="id" value={entry.id}/><input type="hidden" name="status" value="pending"/><button className="fin-mini" type="submit"><Undo2 size={14}/> Reabrir</button></form>}
  <Link href={'/financeiro/'+entry.id}>Editar</Link></div></div>
 </article>)}</div>:<section className="panel projects-empty"><Wallet size={35}/><h2>{filters.q||filters.status!=='all'||filters.direction!=='all'||filters.month!=='all'?'Nenhum lançamento encontrado':'Cadastre seu primeiro lançamento'}</h2><p>Suas receitas, despesas e pendências aparecerão aqui, sem dados fictícios.</p><Link href="/financeiro/novo" className="primary-button"><Plus size={16}/> Novo lançamento</Link></section>}
 {pages>1?<nav className="project-pagination" aria-label="Páginas de lançamentos"><span>Página {filters.page} de {pages}</span><div>{filters.page>1?<Link className="ghost-button" href={urlFor(filters.page-1)}>Anterior</Link>:null}{filters.page<pages?<Link className="ghost-button" href={urlFor(filters.page+1)}>Próxima</Link>:null}</div></nav>:null}
 <p className="finance-disclaimer">O Financeiro não envia dinheiro nem confirma pagamentos automaticamente. Confira a movimentação real antes de marcar um lançamento como concluído.</p>
 </div>
}
