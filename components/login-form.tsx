'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { LockKeyhole, ArrowRight } from 'lucide-react'
import { loginAction, type LoginState } from '@/app/login/actions'
function Submit() {
  const { pending } = useFormStatus()
  return <button className="primary-button login-submit" type="submit" disabled={pending}>{pending ? 'Verificando acesso...' : 'Entrar no Hub'} {!pending && <ArrowRight size={17}/>}</button>
}
export function LoginForm({ configured }: { configured: boolean }) {
  const [state, formAction] = useActionState<LoginState, FormData>(loginAction, { error: '' })
  if (!configured) return <div className="config-missing"><LockKeyhole size={23}/><b>Aguardando configuração</b><p>Conecte seu PostgreSQL Neon gratuito e configure as duas contas autorizadas. Consulte o README para iniciar.</p></div>
  return <form className="login-form" action={formAction}>
    <label htmlFor="email">E-mail corporativo</label><input id="email" name="email" type="email" autoComplete="username" placeholder="voce@arceuz.com" maxLength={254} required />
    <label htmlFor="password">Senha</label><input id="password" name="password" type="password" autoComplete="current-password" placeholder="Digite sua senha" required />
    {state.error && <p role="alert" className="form-error">{state.error}</p>}
    <Submit/><p className="login-note"><LockKeyhole size={14}/> Acesso exclusivo para Mateus e Roberto.</p>
  </form>
}
