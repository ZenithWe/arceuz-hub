import Link from 'next/link'
import {BrainCircuit,MessageSquareText,ShieldCheck,Sparkles,Zap,CheckCircle2,LockKeyhole} from 'lucide-react'
import {requireMember} from '@/lib/auth'
import {conversationsForMember,usageToday} from '@/lib/ai-data'
import {isAiConfigured} from '@/lib/ai-provider'
import {aiModes,knownAiMode} from '@/lib/ai-modes.mjs'
import {AiSidebar} from '@/components/ai-sidebar'
import {AiComposer} from '@/components/ai-composer'
export const metadata={title:'Arceuz AI'}
export const dynamic='force-dynamic'
export default async function AiHome({searchParams}:{searchParams:Promise<{modo?:string;excluida?:string}>}){
 const params=await searchParams
 const mode=knownAiMode(params.modo)?params.modo!:'general'
 const [member,threads,count]=await Promise.all([requireMember(),conversationsForMember(),usageToday()])
 const ready=isAiConfigured()
 return <div className="ai-page">
 <div className="page-header"><div><div className="page-eyebrow">ARCEUZ HUB / FERRAMENTAS INTELIGENTES</div><h1>Arceuz <span className="ai-accent">AI</span></h1><p>Assistentes especializados para acelerar os trabalhos da Arceuz.</p></div><span className={'ai-provider-state '+(ready?'ai-provider-ready':'ai-provider-off')}><span className="ai-state-dot"/>{ready?'Groq configurada':'Groq não configurada'}</span></div>
 {params.excluida==='1'?<p role="status" className="project-success">Conversa excluída do seu histórico.</p>:null}
 <div className="ai-workspace">
  <AiSidebar threads={threads}/>
  <div className="ai-main">
   <section className="panel ai-welcome"><div className="ai-welcome-symbol"><BrainCircuit size={28}/></div><div><span className="ai-welcome-eyebrow"><Sparkles size={13}/> SEU WORKSPACE DE IA</span><h2>Olá, {member.name.split(' ')[0]}!</h2><p>Selecione um assistente e envie sua primeira mensagem. Cada funcionário mantém seu próprio histórico.</p></div></section>
   <section className="ai-modes-section"><div className="ai-section-head"><h2>Escolha seu assistente</h2><span>6 especialidades</span></div><div className="ai-mode-grid">{aiModes.map(([id,title,description])=><Link key={id} href={'/ai?modo='+id} aria-current={id===mode?'true':undefined} className={'ai-mode-card '+(id===mode?'ai-mode-active':'')}><span className="ai-mode-icon">{id==='general'?<BrainCircuit size={19}/>:id==='websites'?<Zap size={19}/>:<MessageSquareText size={19}/>}</span><b>{title}</b><p>{description}</p>{id===mode?<CheckCircle2 size={16} className="ai-mode-check"/>:null}</Link>)}</div></section>
   <section className="panel ai-chat-start"><div className="ai-section-head"><div><h2>Iniciar conversa</h2><p>Selecione o assistente acima para personalizar as respostas.</p></div><span className="ai-quota">Uso: {count}/20 nas últimas 24h</span></div><AiComposer mode={mode} configured={ready}/></section>
   <div className="ai-privacy"><ShieldCheck size={15}/><span>Conversas privadas por conta; conteúdo salvo no Neon e enviado à Groq para gerar respostas. Sem acesso automático aos seus projetos, clientes ou arquivos.</span></div>
  </div>
 </div></div>
}
