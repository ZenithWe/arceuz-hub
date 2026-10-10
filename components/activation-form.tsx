'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { activateAccount, type ActivationState } from '@/app/ativar/actions'

function ConfirmButton() {
  const {pending} = useFormStatus()
  return <button type="submit" disabled={pending} className="primary-button login-submit">{pending ? 'Ativando acesso...' : 'Definir senha e ativar conta'}</button>
}
export function ActivationForm({token}:{token:string}) {
  const [state,action] = useActionState<ActivationState,FormData>(activateAccount,{error:''})
  return <form className="login-form" action={action}>
    <input type="hidden" name="token" value={token}/>
    <label htmlFor="activation-password">Crie uma senha exclusiva (mínimo de 12 caracteres)</label>
    <input id="activation-password" type="password" name="password" minLength={12} maxLength={256} autoComplete="new-password" required/>
    <label htmlFor="activation-confirmation">Confirme sua nova senha</label>
    <input id="activation-confirmation" type="password" name="confirmation" minLength={12} maxLength={256} autoComplete="new-password" required/>
    {state.error && <p role="alert" className="form-error">{state.error}</p>}
    <ConfirmButton/>
    <p className="login-note">Seu convite expira em 24 horas após a emissão e pode ser usado uma única vez.</p>
  </form>
}
