'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FolderKanban, GitBranch, Wallet, UsersRound, ListTodo, BrainCircuit, Settings2, LogOut, Menu, X, ChevronDown, ShieldCheck, ArrowUpRight, CircleDot } from 'lucide-react'
import type { Member } from '@/lib/auth'
import { signOutAction } from '@/app/(private)/actions'
import { Brand } from './brand'
const sections = [
  { label: 'WORKSPACE', links: [
    { href: '/dashboard', label: 'Visão geral', icon: LayoutDashboard, ready: true },
    { href: '/projects', label: 'Projetos & Sites', icon: FolderKanban, ready: true },
    { href: '/github', label: 'Repositórios', icon: GitBranch, ready: true },
  ] },
  { label: 'GESTÃO', links: [
    { href: '/financeiro', label: 'Financeiro', icon: Wallet, ready: false },
    { href: '/clientes', label: 'Clientes', icon: UsersRound, ready: true },
    { href: '/funcionarios', label: 'Funcionários', icon: UsersRound, ready: true },
    { href: '/tarefas', label: 'Tarefas', icon: ListTodo, ready: true },
  ] },
  { label: 'FERRAMENTAS', links: [
    { href: '/ai', label: 'Arceuz AI', icon: BrainCircuit, ready: false },
    { href: '/settings', label: 'Configurações', icon: Settings2, ready: true },
  ] },
]
export function Shell({ member, children }: { member: Member, children: React.ReactNode }) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const initials = member.name.trim().split(/\s+/).slice(0,2).map(s => s[0]).join('').toUpperCase()
  const avatar = member.avatar_url ? <img src={member.avatar_url} alt="Sua foto de perfil" referrerPolicy="no-referrer" /> : initials
  return <div className="hub" data-theme={member.theme}>
    {open && <button className="sidebar-overlay" onClick={() => setOpen(false)} aria-label="Fechar menu" />}
    <aside className={`sidebar ${open ? 'is-open' : ''}`}>
      <div className="sidebar-head"><Brand /><button className="mobile-close" aria-label="Fechar menu" onClick={() => setOpen(false)}><X size={20}/></button></div>
      <div className="sidebar-org"><div className="org-icon">A</div><div><b>Arceuz Workspace</b><small>Plano interno</small></div><ChevronDown size={15}/></div>
      <nav aria-label="Navegação principal" className="sidebar-nav">
        {sections.map(group => <div className="nav-group" key={group.label}>
          <div className="nav-eyebrow">{group.label}</div>
          {group.links.map(link => <Link key={link.href} href={link.href}
            className={`nav-link ${(pathname === link.href || pathname.startsWith(link.href+'/')) ? 'active' : ''}`}
            onClick={() => setOpen(false)} aria-current={(pathname === link.href || pathname.startsWith(link.href+'/')) ? 'page' : undefined}>
            <link.icon size={17} strokeWidth={1.9} /><span>{link.label}</span>{!link.ready && <CircleDot size={10} className="nav-future"/>}
          </Link>)}
        </div>)}
      </nav>
      <div className="sidebar-bottom"><div className="security-note"><ShieldCheck size={15}/><span>Ambiente privado e protegido</span></div>
        <Link href="/settings" className="profile-mini"><span className="avatar">{avatar}</span><span className="profile-mini-copy"><b>{member.name}</b><small>{member.title || 'Administração'}</small></span><Settings2 size={16}/></Link>
      </div>
    </aside>
    <div className="app-workspace">
      <header className="topbar"><div className="topbar-left"><button className="mobile-menu" aria-label="Abrir menu" onClick={() => setOpen(true)}><Menu size={21}/></button><span className="crumb">ARCEUZ</span><span className="slash">/</span><span className="current-crumb">{sections.flatMap(s=>s.links).find(s=>pathname === s.href || pathname.startsWith(s.href+'/'))?.label || 'Central'}</span></div>
        <div className="topbar-actions"><span className="private-pill"><span className="online-dot"/>Ambiente privado</span><Link className="help-link" href="/settings">Minha conta<ArrowUpRight size={14}/></Link><form action={signOutAction}><button className="icon-button" aria-label="Sair da conta" title="Sair"><LogOut size={17}/></button></form></div>
      </header>
      <main className="main-content">{children}</main>
      <footer className="app-footer"><span>© {new Date().getFullYear()} Arceuz Technology</span><span>Arceuz Hub · v0.7 · Repositórios</span></footer>
    </div>
  </div>
}
