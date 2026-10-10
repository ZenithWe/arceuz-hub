import Link from 'next/link'
import { UsersRound, Clock3, Activity, ShieldCheck, UserRound, LogIn, ArrowUpRight, History } from 'lucide-react'
import { employeeDashboard } from '@/lib/activity'
import { activityLabel,formatHubDate } from '@/lib/activity-labels.mjs'
export const dynamic='force-dynamic'
export const metadata={title:'Funcionários'}
export default async function EmployeesPage({searchParams}:{searchParams:Promise<{pessoa?:string}>}){
 const {pessoa}=await searchParams
 const {employees,events,selected}=await employeeDashboard(pessoa)
 return <div className="employees-page">
  <div className="page-header"><div><div className="page-eyebrow">ARCEUZ HUB / EQUIPE E ATIVIDADES</div><h1>Funcionários</h1><p>Acompanhe os acessos e as ações realizadas por cada integrante dentro do Hub.</p></div><span className="employees-private"><ShieldCheck size={16}/> Acesso interno</span></div>
  <div className="employee-people">
   {employees.map(person=><article className="panel employee-card" key={person.id}>
    <div className="employee-heading"><span className="employee-avatar">{person.avatar_url?<img src={person.avatar_url} alt="" referrerPolicy="no-referrer"/>:person.name.slice(0,1).toUpperCase()}</span><div><h2>{person.name}</h2><p>{person.title||'Equipe Arceuz'}</p><span className="employee-active">Conta autorizada</span></div></div>
    <div className="employee-stats">
     <div><div className="employee-stat-label"><LogIn size={15}/> Último login</div><b>{formatHubDate(person.last_login_at)}</b></div>
     <div><div className="employee-stat-label"><Activity size={15}/> Última atividade registrada</div><b>{person.last_action?activityLabel(person.last_action):'Nenhuma ação registrada'}</b>
      {person.last_subject&&<p className="employee-action-detail">{person.last_subject}</p>}
      {person.last_action_at&&<small>{formatHubDate(person.last_action_at)}</small>}
     </div>
    </div>
    <div className="employee-footer"><span><History size={14}/>{person.event_count} registros</span><Link href={'/funcionarios?pessoa='+person.id}>Ver atividades <ArrowUpRight size={15}/></Link></div>
   </article>)}
  </div>
  <section className="panel employee-history">
   <div className="employee-history-head"><div><div className="employee-history-title"><Activity size={20}/><h2>Histórico de atividades</h2></div><p>Até 60 ações recentes. O histórico começou a ser registrado com este módulo.</p></div><form method="GET" action="/funcionarios"><label htmlFor="person-filter">Funcionário</label><select id="person-filter" name="pessoa" defaultValue={selected}><option value="all">Toda a equipe</option>{employees.map(m=><option key={m.id} value={m.id}>{m.name}</option>)}</select><button type="submit" className="ghost-button">Filtrar</button></form></div>
   {events.length?<div className="employee-timeline">{events.map(event=><div className="employee-event" key={event.id}><div className="employee-event-icon"><UserRound size={16}/></div><div className="employee-event-body"><div className="employee-event-line"><b>{event.name}</b><span>{activityLabel(event.action)}</span></div>{event.subject?<p>{event.subject}</p>:null}</div><time dateTime={event.created_at}><Clock3 size={13}/>{formatHubDate(event.created_at)}</time></div>)}</div>:<div className="employee-empty"><History size={33}/><h3>Aguardando primeiras atividades</h3><p>Novos logins e alterações de clientes, projetos, tarefas e perfis aparecerão aqui. Ações anteriores à ativação do registro não são recuperadas.</p></div>}
  </section>
  <p className="employee-note"><ShieldCheck size={14}/> Apenas atividades internas do Arceuz Hub são registradas. Os horários usam Brasília (BRT) e o último login não indica que a pessoa está online agora.</p>
 </div>
}
