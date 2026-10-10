import Link from 'next/link'
import { FolderKanban, Globe2, GitBranch, Wallet, ArrowUpRight, ArrowDownRight, TrendingUp, ListTodo, Activity, Clock3, Plus, LockKeyhole, CircleHelp, Layers3 } from 'lucide-react'
import { requireMember } from '@/lib/auth'
import { loadDashboard, periodOptions, resolvePeriod, brl, dateBounds } from '@/lib/dashboard'
import { RevenueChart } from '@/components/revenue-chart'
export const metadata = { title: 'Visão geral' }
export default async function Dashboard({ searchParams }: { searchParams: Promise<{period?:string}> }) {
  const { period: requestedPeriod } = await searchParams
  const period = resolvePeriod(requestedPeriod)
  const [member, stats] = await Promise.all([requireMember(), loadDashboard(period)])
  const metrics = [
    {title:'Projetos cadastrados', value:String(stats.totalProjects), icon:FolderKanban, detail:'Total na plataforma', tone:'orange'},
    {title:'Projetos ativos', value:String(stats.activeProjects), icon:Layers3, detail:'Em execução ou planejamento',tone:'violet'},
    {title:'Sites publicados',value:String(stats.publishedSites),icon:Globe2,detail:'Produção registrada',tone:'green'},
    {title:'Repositórios',value:String(stats.repositories),icon:GitBranch,detail:'Vinculados ao Hub',tone:'blue'},
  ]
  const money = [
    { title:'Receita recebida',amount:stats.incomeCents,icon:ArrowUpRight, tone:'green'},
    { title:'Despesas pagas',amount:stats.expensesCents,icon:ArrowDownRight,tone:'red'},
    { title:'Resultado do período',amount:stats.resultCents,icon:TrendingUp,tone:'orange'},
    { title:'A receber',amount:stats.receivableCents,icon:Wallet,tone:'violet'},
  ]
  return <div className="dashboard-page">
    <div className="page-header"><div><div className="page-eyebrow"><span className="eyebrow-dot"/> CENTRO DE COMANDO <span className="divider-dot">·</span> ARCEUZ HUB</div><h1>Visão geral <span className="wave">↗</span></h1><p>Olá, {member.name.split(' ')[0]}. Acompanhe o que acontece na Arceuz em um só lugar.</p></div><div className="header-controls"><div className="date-control"><Clock3 size={16}/><span>{dateBounds(period).start.split('-').reverse().join('/')} — {dateBounds(period).end.split('-').reverse().join('/')}</span></div></div></div>
    {!stats.available && <div role="alert" className="error-banner"><CircleHelp size={18}/><span>{stats.issue}</span></div>}
    <section className="welcome-banner"><div><div className="banner-label"><span/> SEU WORKSPACE ESTÁ PRONTO</div><h2>Sua operação, <em>mais conectada.</em></h2><p>O espaço central para organizar projetos, acompanhar resultados e construir o futuro da Arceuz.</p><Link href="/projects" className="banner-button">Explorar projetos <ArrowUpRight size={15}/></Link></div><div className="banner-art" aria-hidden="true"><div className="art-ring ring1"/><div className="art-ring ring2"/><div className="art-symbol">A</div><div className="art-coordinate">ARCEUZ / SYSTEM 01</div></div></section>
    <div className="section-heading"><div><h2>Indicadores operacionais</h2><p>Panorama dos projetos e da infraestrutura cadastrada</p></div><span className="label-muted"><Activity size={15}/> Dados do banco</span></div>
    <section className="metrics-grid" aria-label="Indicadores operacionais">{metrics.map(item => <article className="metric-card" key={item.title}><div className="metric-header"><div className={`metric-icon ${item.tone}`}><item.icon size={19}/></div><ArrowUpRight size={18} className="metric-corner"/></div><div className="metric-value">{stats.available ? item.value : '—'}</div><div className="metric-title">{item.title}</div><div className="metric-detail">{item.detail}</div></article>)}</section>
    <div className="section-heading finance-heading"><div><h2>Desempenho financeiro</h2><p>Somente valores confirmados como pagos ou recebidos</p></div><div className="period-pills" role="group" aria-label="Período">{periodOptions.map(option=><Link href={`/dashboard?period=${option.key}`} aria-current={option.key===period?'true':undefined} key={option.key} className={option.key===period?'selected':''}>{option.name}</Link>)}</div></div>
    <section className="finance-grid" aria-label="Indicadores financeiros">{money.map(item=><article className="finance-metric" key={item.title}><div className="finance-icon-title"><span className={`finance-icon ${item.tone}`}><item.icon size={16}/></span>{item.title}</div><b>{stats.available?brl(item.amount):'—'}</b><span className="micro-note">{stats.available?'Conforme lançamentos registrados':'Dados indisponíveis'}</span></article>)}</section>
    <section className="detail-grid"><article className="panel analytics-panel"><div className="panel-head"><div><h3>Receitas × Despesas</h3><span>Comparativo dos últimos 6 meses</span></div><div className="panel-icon"><Activity size={17}/></div></div><RevenueChart months={stats.available?stats.monthly:[]}/></article><article className="panel tasks-panel"><div className="panel-head"><div><h3>Próximas atividades</h3><span>Seu ritmo de trabalho, em dia</span></div><div className="panel-icon"><ListTodo size={18}/></div></div><div className="task-summary"><div><span className="task-number">{stats.available?stats.upcomingTasks:'—'}</span><small>Próximos 7 dias</small></div><div><span className="task-number">{stats.available?stats.overdueTasks:'—'}</span><small>Tarefas atrasadas</small></div></div><div className="panel-empty"><div className="empty-small-icon"><ListTodo size={19}/></div><p>Nenhuma tarefa para exibir agora.</p><span>O gerenciamento de tarefas será liberado na Fase 5.</span></div><Link href="/tarefas" className="panel-link">Ver módulo de tarefas <ArrowUpRight size={15}/></Link></article></section>
    <div className="section-heading bottom-heading"><div><h2>Atalhos da central</h2><p>Tenha suas ferramentas de trabalho por perto</p></div></div><section className="shortcut-grid"><Link href="/projects"><span className="shortcut-icon"><FolderKanban size={20}/></span><span><b>Projetos & Sites</b><small>Organize seus trabalhos</small></span><ArrowUpRight size={17}/></Link><Link href="/github"><span className="shortcut-icon"><GitBranch size={20}/></span><span><b>GitHub</b><small>Acompanhe repositórios</small></span><ArrowUpRight size={17}/></Link><Link href="/ai"><span className="shortcut-icon"><Plus size={20}/></span><span><b>Arceuz AI</b><small>Prompts e automações</small></span><ArrowUpRight size={17}/></Link><Link href="/settings"><span className="shortcut-icon"><LockKeyhole size={20}/></span><span><b>Minha conta</b><small>Preferências e segurança</small></span><ArrowUpRight size={17}/></Link></section>
  </div>
}
