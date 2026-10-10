'use server'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { requireMember,updateMemberProfile,updateMemberPassword } from '@/lib/auth'
const updateSchema=z.object({
  name:z.string().trim().min(2,'Informe seu nome.').max(90),
  title:z.string().trim().max(90),bio:z.string().trim().max(500),
  avatar_url:z.union([z.literal(''),z.string().url().startsWith('https://').max(500)]),
  theme:z.enum(['dark','light']),
})
export type SettingsState={message:string;error:boolean}
export async function updateSettingsAction(_state:SettingsState,formData:FormData):Promise<SettingsState>{
  const member=await requireMember()
  const parsed=updateSchema.safeParse(Object.fromEntries(['name','title','bio','avatar_url','theme'].map(k=>[k,formData.get(k)])))
  if(!parsed.success) return {error:true,message:parsed.error.issues[0]?.message??'Verifique os campos.'}
  try {
    const ok=await updateMemberProfile(member,{...parsed.data,avatar_url:parsed.data.avatar_url||null})
    if(!ok) return {error:true,message:'Não foi possível salvar seu perfil.'}
  } catch {return {error:true,message:'Falha ao salvar. Tente novamente.'}}
  revalidatePath('/settings');revalidatePath('/dashboard')
  return {error:false,message:'Preferências salvas com sucesso.'}
}
const passwordSchema=z.object({
  currentPassword:z.string().min(1).max(256),
  newPassword:z.string().min(12,'A nova senha deve ter pelo menos 12 caracteres.').max(256),
  confirmPassword:z.string().min(1),
}).refine(d=>d.newPassword===d.confirmPassword,{message:'As novas senhas não coincidem.'})
export async function changePasswordAction(_state:SettingsState,formData:FormData):Promise<SettingsState>{
  const member=await requireMember()
  const parsed=passwordSchema.safeParse({currentPassword:formData.get('currentPassword'),
    newPassword:formData.get('newPassword'),confirmPassword:formData.get('confirmPassword')})
  if(!parsed.success) return {error:true,message:parsed.error.issues[0]?.message??'Dados inválidos.'}
  if(parsed.data.currentPassword===parsed.data.newPassword) return {error:true,message:'Escolha uma senha diferente da atual.'}
  try {
    const ok=await updateMemberPassword(member,parsed.data.currentPassword,parsed.data.newPassword)
    return ok ? {error:false,message:'Senha alterada. Outras sessões foram encerradas.'}:
      {error:true,message:'Senha atual incorreta ou alteração não concluída.'}
  } catch {return {error:true,message:'Não foi possível alterar a senha.'}}
}
