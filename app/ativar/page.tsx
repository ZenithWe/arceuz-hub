import { redirect } from 'next/navigation'
import { ActivationForm } from '@/components/activation-form'
import { Brand } from '@/components/brand'
import { isHubConfigured } from '@/lib/config'

export const dynamic = 'force-dynamic'
export default async function ActivatePage({searchParams}:{searchParams:Promise<{token?:string}>}) {
  const {token}=await searchParams
  if(!isHubConfigured() || !token || !/^[A-Za-z0-9_-]{43}$/.test(token)) {
    redirect('/login')
  }
  return <main className="login-page activation-page">
    <div className="login-visual"><div className="login-grid"/><div className="login-visual-content"><Brand/><div className="login-hero"><span className="eyebrow-orange">CONVITE PRIVADO</span><h1>Seu acesso.<br/><em>Seu controle.</em></h1><p>Uma central privada e protegida para quem constrói a Arceuz.</p></div></div></div>
    <div className="login-side"><div className="login-side-top"><Brand/> <span>ACESSO POR CONVITE</span></div>
      <div className="login-panel"><p className="eyebrow">ATIVAÇÃO DE CONTA</p><h2>Defina sua senha.</h2><p className="login-subtitle">Este convite é pessoal. Não compartilhe o link com outras pessoas.</p><ActivationForm token={token}/></div>
      <div className="login-side-footer">Arceuz Hub · Área privada</div>
    </div>
  </main>
}
