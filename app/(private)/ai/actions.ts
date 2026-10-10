'use server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { requireMember } from '@/lib/auth'
import { db } from '@/lib/db'
import { groqReply,isAiConfigured } from '@/lib/ai-provider'
import { normalizeAiMessage,conversationTitle,knownAiMode } from '@/lib/ai-modes.mjs'
import { usageToday,getChat,isChatId } from '@/lib/ai-data'

type State={error:string}
const DAILY_LIMIT=20
export async function startConversationAction(_prev:State,form:FormData):Promise<State>{
 const member=await requireMember()
 if(!isAiConfigured())return {error:'Configure a chave da Groq no Render para conversar com a IA.'}
 const content=normalizeAiMessage(form.get('message'))
 if(!content.value)return {error:content.error??'Mensagem inválida.'}
 const rawMode=String(form.get('mode')??'')
 if(!knownAiMode(rawMode))return {error:'Modo de assistente inválido.'}
 const quota=await usageToday()
 if(quota>=DAILY_LIMIT)return {error:'Limite interno de 20 respostas a cada 24 horas atingido.'}
 const response=await groqReply(rawMode,[{role:'user',content:content.value}])
 if(!('value' in response)||!response.value)return {error:'error' in response?response.error:'A IA não conseguiu responder.'}
 let conversationId:string
 try{
  const sql=db()
  const rows=await sql`WITH chat AS (
   INSERT INTO hub_ai_conversations(owner_id,title,mode)
   VALUES(${member.id},${conversationTitle(content.value)},${rawMode}) RETURNING id
  ), saved_messages AS (
   INSERT INTO hub_ai_messages(conversation_id,role,content)
   SELECT chat.id,m.role,m.content FROM chat,
    (VALUES ('user'::text,${content.value}),('assistant'::text,${response.value}))
    AS m(role,content) RETURNING id
  )
  SELECT id FROM chat`
  if(!rows.length)return {error:'Não foi possível registrar esta conversa.'}
  conversationId=String(rows[0].id)
 }catch{return {error:'A resposta foi gerada, mas não foi possível salvar a conversa.'}}
 revalidatePath('/ai')
 redirect('/ai/'+conversationId)
}
export async function continueConversationAction(id:string,_prev:State,form:FormData):Promise<State>{
 const member=await requireMember()
 if(!isAiConfigured())return {error:'A chave da Groq ainda não está configurada no Render.'}
 if(!isChatId(id))return {error:'Conversa inválida.'}
 const content=normalizeAiMessage(form.get('message'))
 if(!content.value)return {error:content.error??'Mensagem inválida.'}
 const sql=db()
 const ownership=await sql`SELECT id,mode FROM hub_ai_conversations
   WHERE id::text=§id AND owner_id=${member.id} LIMIT 1`
 if(!ownership.length)return {error:'A conversa não foi encontrada na sua conta.'}
 const quota=await usageToday()
 if(quota>=DAILY_LIMIT)return {error:'Limite de 20 respostas nas últimas 24 horas atingido.'}
 const messages=await sql`SELECT role,content FROM hub_ai_messages
   WHERE conversation_id::text=§id ORDER BY seq DESC LIMIT 11`
 const previous=messages.reverse().map(m=>({role:m.role as 'user'|'assistant',content:String(m.content)}))
 const answer=await groqReply(String(ownership[0].mode),[...previous,{role:'user',content:content.value}])
 if(!('value' in answer)||!answer.value)return {error:'error' in answer?answer.error:'Não foi possível obter resposta.'}
 try{
  await sql`WITH inserted AS (
   INSERT INTO hub_ai_messages(conversation_id,role,content)
   SELECT §id::uuid,m.role,m.content FROM
    (VALUES ('user'::text,${content.value}),('assistant'::text,${answer.value})) AS m(role,content)
   WHERE EXISTS(SELECT 1 FROM hub_ai_conversations WHERE id::text=§id AND owner_id=${member.id})
   RETURNING id
  )
  UPDATE hub_ai_conversations SET updated_at=now()
  WHERE id::text=§id AND owner_id=${member.id} AND EXISTS(SELECT 1 FROM inserted)`
 }catch{return {error:'A IA respondeu, mas não foi possível salvar as novas mensagens.'}}
 revalidatePath('/ai')
 revalidatePath('/ai/'+id)
 redirect('/ai/'+id+'?atualizado=1')
}
export async function deleteConversationAction(id:string,_form:FormData){
 const member=await requireMember()
 if(!isChatId(id))redirect('/ai')
 const sql=db()
 await sql`DELETE FROM hub_ai_conversations WHERE id::text=§id AND owner_id=${member.id}`
 revalidatePath('/ai')
 redirect('/ai?excluida=1')
}
