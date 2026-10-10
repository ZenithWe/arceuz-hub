import { requireMember } from '@/lib/auth'
import { SettingsForm } from '@/components/settings-form'
import { ChangePassword } from '@/components/change-password'
import { UserRound, ShieldCheck, Mail } from 'lucide-react'
export const metadata = { title: 'Configurações' }
export default async function SettingsPage() {
  const member = await requireMember()
  const initial = member.name.split(/\s+/).map(s=>s[0]).slice(0,2).join('').toUpperCase()
  return <div className="settings-page"><div className="page-header"><div><div className="page-eyebrow">PERFIL & PREFERÊNCIAS</div><h1>Minha conta</h1><p>Gerencie suas informações e personalize sua experiência na central.</p></div></div>
    <div className="settings-layout"><section className="panel settings-panel"><div className="section-heading"><div><h2>Informações pessoais</h2><p>Somente você pode editar os dados abaixo</p></div><UserRound size={19}/></div><SettingsForm member={member}/></section><section className="panel password-panel"><div className="section-heading"><div><h2>Alterar senha</h2><p>Confirme sua senha atual antes de escolher uma nova</p></div></div><ChangePassword/></section>
    <aside className="settings-side"><div className="panel identity-card"><div className="identity-avatar">{member.avatar_url ? <img src={member.avatar_url} alt="Foto de perfil" referrerPolicy="no-referrer"/>:initial}</div><h3>{member.name}</h3><span className="role-pill">{member.slot === 'mateus' ? 'Mateus' : 'Roberto'} · Acesso autorizado</span><p>{member.title||'Gestão Arceuz'}</p></div>
    <div className="panel access-card"><h3><ShieldCheck size={18}/> Segurança da conta</h3><p>Seu acesso está vinculado a um dos dois perfis autorizados no banco de dados.</p><div className="setting-item"><Mail size={15}/>{member.email}</div><div className="setting-item"><ShieldCheck size={15}/> Cadastro público desabilitado</div><p className="note-small">Recuperação de conta por e-mail ainda não está disponível. Em caso de perda de acesso, use o script administrativo de redefinição de senha do Hub.</p></div></aside></div>
  </div>
}
