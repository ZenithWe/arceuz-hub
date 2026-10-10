'use server'
import { redirect } from 'next/navigation'
import { authenticate } from '@/lib/auth'
import { isHubConfigured } from '@/lib/config'
export type LoginState = { error:string }
export async function loginAction(_state: LoginState, formData: FormData): Promise<LoginState> {
  if (!isHubConfigured()) return {error:'O banco e a autenticação ainda não foram configurados.'}
  try {
    const result=await authenticate(String(formData.get('email')??''), String(formData.get('password')??''))
    if (!result.ok) return {error:'Credenciais inválidas ou acesso temporariamente bloqueado.'}
  } catch {return {error:'Serviço indisponível no momento. Tente novamente.'}}
  redirect('/dashboard')
}
