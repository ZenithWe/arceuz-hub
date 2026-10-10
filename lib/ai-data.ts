import 'server-only'
import { requireMember } from './auth'
import { db } from './db'
import { knownAiMode } from './ai-modes.mjs'
export type Conversation={id:string;title:string;mode:string;created_at:string;updated_at:string;message_count:number}
export type ChatMessage={id:string;seq:string;role:'user'|'assistant';content:string;created_at:string}
export function isChatId(value:unknown){return typeof value==='string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)}
export async function conversationsForMember(){
 const member=await requireMember(),sql=db()
 const rows=await sql`SELECT c.id,c.title,c.mode,c.created_at::text AS created_at,
  c.updated_at::text AS updated_at,
  (SELECT count(*)::integer FROM hub_ai_messages m WHERE m.conversation_id=c.id) AS message_count
  FROM hub_ai_conversations c WHERE c.owner_id=${member.id}
  ORDER BY c.updated_at DESC,c.id DESC LIMIT 60`
 return rows as Conversation[]
}
export async function getChat(id:string){
 const member=await requireMember()
 if(!isChatId(id))return null
 const sql=db()
 const [chats,messages]=await Promise.all([
  sql`SELECT id,title,mode,created_at::text AS created_at,updated_at::text AS updated_at
  FROM hub_ai_conversations WHERE id::text=${id} AND owner_id=${member.id} LIMIT 1`,
  sql`SELECT m.id,m.seq::text AS seq,m.role,m.content,m.created_at::text AS created_at
  FROM hub_ai_messages m JOIN hub_ai_conversations c ON c.id=m.conversation_id
  WHERE c.id::text=${id} AND c.owner_id=${member.id} ORDER BY m.seq ASC LIMIT 300`
 ])
 if(!chats.length)return null
 return {conversation:chats[0] as Conversation,messages:messages as ChatMessage[]}
}
export async function usageToday(){
 const member=await requireMember(),sql=db()
 const rows=await sql`SELECT count(*)::integer AS count FROM hub_ai_messages m
 JOIN hub_ai_conversations c ON c.id=m.conversation_id
 WHERE c.owner_id=${member.id} AND m.role='assistant' AND m.created_at>now()-interval '24 hours'`
 return Number(rows[0]?.count??0)
}
export function normalizeChatMode(mode:string){return knownAiMode(mode)?mode:'general'}
