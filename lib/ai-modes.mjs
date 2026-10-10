export const aiModes=[
 ['general','Assistente geral','Organização, decisões e dúvidas de negócio.'],
 ['sales','Agente de vendas','Abordagem comercial, objeções e prospecção.'],
 ['proposals','Criador de propostas','Orçamentos, e-mails e propostas para clientes.'],
 ['marketing','Conteúdo e marketing','Ideias, legendas, campanhas e anúncios.'],
 ['websites','Sites e programação','Estruturas de sites, código e diagnóstico técnico.'],
 ['analysis','Analista de negócios','Interpretação de dados fornecidos e recomendações.'],
]
export function knownAiMode(value){return aiModes.some(([id])=>id===value)}
export function aiModeLabel(value){return aiModes.find(([id])=>id===value)?.[1]??'Assistente geral'}
export function normalizeAiMessage(raw){
 if(typeof raw!=='string')return {error:'Escreva uma mensagem.'}
 const message=raw.trim()
 if(message.length<2)return {error:'A mensagem precisa ter pelo menos 2 caracteres.'}
 if(message.length>4500)return {error:'A mensagem deve ter no máximo 4.500 caracteres.'}
 return {value:message}
}
export function conversationTitle(message){
 if(typeof message!=='string')return 'Nova conversa'
 const x=message.replace(/\s+/g,' ').trim()
 return x.length>100?x.slice(0,97)+'...':x||'Nova conversa'
}
export function formatAiDate(value){
 const d=new Date(value)
 if(!Number.isFinite(d.getTime()))return 'Sem data'
 return new Intl.DateTimeFormat('pt-BR',{timeZone:'America/Sao_Paulo',day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'}).format(d)
}
