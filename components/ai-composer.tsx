'use client'
import { useActionState } from 'react'
import { useFormStatus } from 'react-dom'
import { Send,KeyRound } from 'lucide-react'
import { startConversationAction,continueConversationAction } from '@/app/(private)/ai/actions'
function Submit(){const {pending}=useFormStatus();return <button className="primary-button ai-send" type="submit" disabled={pending} aria-label="Enviar mensagem"><Send size={18}/><span>{pending?'Respondendo...':'Enviar'}</span></button>}
export function AiComposer({mode,chatId,configured}:{mode:string;chatId?:string;configured:boolean}){
 const action=chatId?continueConversationAction.bind(null,chatId):startConversationAction
 const [state,formAction]=useActionState(action,{error:''})
 if(!configured)return <div className="panel ai-unconfigured"><div className="ai-unconfigured-title"><KeyRound size={20}/><b>Conexão com IA pendente</b></div><p>O visual e o histórico já estão prontos. Para habilitar as respostas, configure a variável privada <code>GROQ_API_KEY</code> no serviço Arceuz Hub do Render. Nunca cole a chave no chat nem no código público.</p><a href="https://console.groq.com/keys" target="_blank" rel="noopener noreferrer" className="ghost-button">Abrir página oficial da Groq</a></div>
 return <form action={formAction} className="ai-composer">
  {!chatId?<input type="hidden" name="mode" value={mode}/>:null}
  <label htmlFor="ai-prompt" className="ai-composer-label">Sua mensagem para o Arceuz AI</label>
  <textarea id="ai-prompt" required minLength={2} maxLength={4500} rows={3} name="message" placeholder="Descreva o que você precisa para seu trabalho..."/>
  {state.error?<div className="error-banner" role="alert">{state.error}</div>:null}
  <div className="ai-composer-footer"><span>Respostas geradas pela Groq · Confirme dados importantes · Não envie segredos</span><Submit/></div>
 </form>
}
