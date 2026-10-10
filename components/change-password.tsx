'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { KeyRound } from 'lucide-react'
import { changePasswordAction, type SettingsState } from '@/app/(private)/settings/actions'
function Submit() {const {pending}=useFormStatus();return <button type="submit" disabled={pending} className="primary-button"><KeyRound size={16}/>{pending?'Atualizando...':'Alterar senha'}</button>}
export function ChangePassword() {
  const [state, submit] = useActionState<SettingsState,FormData>(changePasswordAction,{message:'',error:false})
  return <form action={submit} className="settings-form">
    <div className="field"><label htmlFor="currentPassword">Senha atual</label><input id="currentPassword" name="currentPassword" type="password" autoComplete="current-password" required/></div>
    <div className="form-two"><div className="field"><label htmlFor="newPassword">Nova senha</label><input id="newPassword" name="newPassword" type="password" minLength={12} autoComplete="new-password" required/></div><div className="field"><label htmlFor="confirmPassword">Confirme a nova senha</label><input id="confirmPassword" name="confirmPassword" type="password" minLength={12} autoComplete="new-password" required/></div></div>
    <div className="settings-actions"><Submit/>{state.message && <span className={state.error?'form-error':'form-success'} role="status">{state.message}</span>}</div>
  </form>
}
