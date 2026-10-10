import Link from 'next/link'
import {Plus,MessageSquareText,Clock3} from 'lucide-react'
import {formatAiDate} from '@/lib/ai-modes.mjs'
import type {Conversation} from '@/lib/ai-data'
export function AiSidebar({threads,selected}:{threads:Conversation[];selected?:string}){
 return <aside className="ai-sidebar panel" aria-label="Histórico de conversas"><div className="ai-sidebar-head"><h2>Conversas</h2><Link href="/ai" className="ai-new-button"><Plus size={15}/> Nova</Link></div>
  <div className="ai-sidebar-list">{threads.length?threads.map(t=><Link key={t.id} href={'/ai/'+t.id} className={'ai-thread '+(selected===t.id?'ai-thread-active':'')}><MessageSquareText size={15}/><div><b>{t.title}</b><small><Clock3 size={11}/>{formatAiDate(t.updated_at)}</small></div></Link>):<div className="ai-sidebar-empty">Seu histórico aparecerá aqui após a primeira resposta.</div>}</div>
 </aside>
}
