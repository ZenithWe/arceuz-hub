'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Save, ShieldCheck } from 'lucide-react'
import type { Member } from '@/lib/auth'
import { updateSettingsAction, type SettingsState } from '@/app/(private)/settings/actions'
function SubmitButton() { const { pending } = useFormStatus(); return <button className="primary-button" disabled={pending} type="submit"><Save size={16}/>{pending?'Salvando...':'Salvar alterações'}</button> }
export function SettingsForm({ member }: { member: Member }) {
  const [state, submit] = useActionState<SettingsState, FormData>(updateSettingsAction, {message:'',error:false})
  return <form action={submit} className="settings-form">
    <div className="form-two"><div className="field"><label htmlFor="name">Nome de exibição</label><input id="name" name="name" defaultValue={member.name} maxLength={90} required /></div><div className="field"><label htmlFor="title">Cargo / função</label><input id="title" name="title" defaultValue={member.title||''} maxLength={90} placeholder="Ex.: Desenvolvimento"/></div></div>
    <div className="field"><label htmlFor="bio">Sobre mim</label><textarea name="bio" id="bio" maxLength={500} rows={4} defaultValue={member.bio||''} placeholder="Fale um pouco sobre sua função na Arceuz"/></div>
    <div className="field"><label htmlFor="avatar_url">Foto de perfil (link HTTPS)</label><input type="url" name="avatar_url" id="avatar_url" defaultValue={member.avatar_url||''} placeholder="https://..."/><span className="field-help">Nesta fase é possível usar uma imagem hospedada por HTTPS.</span></div>
    <div className="field"><label htmlFor="theme">Tema da interface</label><select name="theme" id="theme" defaultValue={member.theme}><option value="dark">Escuro — preto e laranja</option><option value="light">Claro — branco e laranja</option></select></div>
    <div className="settings-actions"><SubmitButton/>{state.message&&<span className={state.error?'form-error':'form-success'} role="status">{state.message}</span>}</div>
    <div className="settings-security"><ShieldCheck size={16}/><span>Você só pode alterar o seu próprio perfil. Seu nível de acesso e e-mail de autenticação não podem ser modificados aqui.</span></div>
  </form>
}
