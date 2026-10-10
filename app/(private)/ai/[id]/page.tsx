import Link from 'next/link'
import {notFound} from 'next/navigation'
import {ArrowLeft,BrainCircuit,Trash2,ShieldCheck} from 'lucide-react'
import {getChat,conversationsForMember,usageToday} from '@/lib/ai-data'
import {isAiConfigured} from '@/lib/ai-provider'
import {aiModeLabel,formatAiDate} from '@/lib/ai-modes.mjs'
import {AiSidebar} from '@/components/ai-sidebar'
import {AiComposer} from '@/components/ai-composer'
import {deleteConversationAction} from '../actions'
export const metadata={title:'Conversa Arceuz AI'}
export const dynamic='force-dynamic'
export default async function AiChatPage({params}:{params:Promise<{id:string}>}){
 const {id}=await params
 const [chat,threads,count]=await Promise.all([getChat(id),conversationsForMember(),usageToday()])
 if(!chat)notFound()
 const ready=isAiConfigured()
 return <div className="ai-page">
  <div className="page-header"><div><div className="page-eyebrow">ARCEUZ AI / CONVERSA PRIVADA</div><h1>Arceuz <span className="ai-accent">AI</span></h1><p>{aiModeLabel(chat.conversation.mode)} · {chat.conversation.title}</p></div><Link href="/ai" className="ghost-button"><ArrowLeft size={16}/> Nova conversa</Link></div>
  <div className="ai-workspace"><AiSidebar threads={threads} selected={id}/><section className="ai-main">
   <div className="panel ai-chat-room"><div className="ai-room-head"><div><div className="ai-room-badge"><BrainCircuit size={17}/></div><div><h2>{chat.conversation.title}</h2><p>{aiModeLabel(chat.conversation.mode)} · {count}/20 respostas nas últimas 24h</p></div></div><form action={deleteConversationAction.bind(null,id)}><button type="submit" className="ai-delete-conversation" title="Excluir esta conversa"><Trash2 size={15}/> Excluir conversa</button></form></div>
   <div className="ai-message-list">{chat.messages.map(m=><article className={'ai-message ai-message-'+m.role} key={m.id}><div className="ai-message-top"><b>{m.role==='user'?'Você':'Arceuz AI'}</b><time dateTime={m.created_at}>{formatAiDate(m.created_at)}</time></div><div className="ai-message-body">{m.content}</div></article>)}</div>
   <AiComposer chatId={id} mode={chat.conversation.mode} configured={ready}/>
   </div>
   <p className="ai-privacy"><ShieldCheck size={15}/> Respostas geradas por IA podem conter imprecisões. A conversa não executa alterações nos sistemas da Arceuz.</p>
  </section></div>
 </div>
}
