import { redirect } from 'next/navigation'
import { Brand } from '@/components/brand'
import { LoginForm } from '@/components/login-form'
import { isHubConfigured } from '@/lib/config'
import { optionalMember } from '@/lib/auth'
import { ShieldCheck, Workflow, ArrowUpRight, LockKeyhole } from 'lucide-react'
export const dynamic = 'force-dynamic'
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ ativado?: string }> }) {
  const {ativado} = await searchParams
  const configured=isHubConfigured()
  let member = null
  if(configured) { try {member=await optionalMember()} catch { /* Database not migrated yet. */ } }
  if(member) redirect('/dashboard')
  return <main className="login-page">
    <div className="login-visual"><div className="login-grid"/><div className="login-visual-content"><Brand/><div className="login-hero"><span className="eyebrow-orange"><span className="glow-dot"/>ARCEUZ INTERNAL SYSTEM</span><h1>Controle total.<br/><em>Uma única</em><br/>central.</h1><p>Projetos, tecnologia e gestão em um só lugar. Criado para quem está construindo o futuro da Arceuz.</p><div className="login-features"><span><Workflow size={16}/> Operação centralizada</span><span><ShieldCheck size={16}/> Acesso protegido</span></div></div><div className="visual-footer"><span>DESIGNED FOR THE BUILDERS</span><ArrowUpRight size={20}/></div></div></div>
    <div className="login-side"><div className="login-side-top"><span className="mobile-only"><Brand/></span><span>PORTAL ADMINISTRATIVO <LockKeyhole size={15}/></span></div><div className="login-panel"><div className="login-panel-icon"><LockKeyhole size={23}/></div><p className="eyebrow">ACESSO À CENTRAL</p><h2>Bem-vindo de volta.</h2><p className="login-subtitle">Entre com suas credenciais para continuar a gestão da Arceuz.</p>{ativado === '1' && <p role="status" className="activation-success">Conta ativada! Entre com seu e-mail e sua nova senha.</p>}<LoginForm configured={configured}/></div><div className="login-side-footer">Arceuz Hub <span>© {new Date().getFullYear()}</span></div></div>
  </main>
}
