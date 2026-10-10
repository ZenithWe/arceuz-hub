const slugPart=/^[A-Za-z0-9][A-Za-z0-9._-]{0,99}$/
const ownerPart=/^[A-Za-z0-9](?:[A-Za-z0-9-]{0,37}[A-Za-z0-9])?$/
export function normalizeRepositoryInput(raw){
 if(typeof raw!=='string')return {error:'Informe o endereço do repositório.'}
 let name=raw.trim()
 if(name.length>300)return {error:'Endereço muito longo.'}
 if(name.startsWith('https://')){
  let url
  try{url=new URL(name)}catch{return {error:'Endereço do GitHub inválido.'}}
  if(url.hostname.toLowerCase()!=='github.com'||url.username||url.password||url.port||url.search||url.hash){
   return {error:'Use um endereço HTTPS do github.com, sem parâmetros.'}
  }
  name=url.pathname.replace(/^\/|\/$/g,'')
 }else if(name.includes('://')||name.startsWith('//')){
  return {error:'Use um endereço HTTPS do GitHub.'}
 }
 name=name.replace(/\.git$/i,'')
 const parts=name.split('/')
 if(parts.length!==2||!ownerPart.test(parts[0])||!slugPart.test(parts[1])||
    parts[1]==='.'||parts[1]==='..')return {error:'Informe no formato usuario/repositorio.'}
 const full_name=parts.join('/').toLowerCase()
 return {value:{full_name,html_url:'https://github.com/'+full_name}}
}
export function normalizeRepositoryProject(value){
 if(!value)return {value:null}
 if(typeof value!=='string'|| !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)){
  return {error:'Projeto inválido.'}
 }
 return {value}
}
export function repositorySyncLabel(value){
 if(value==='ok')return 'Sincronizado'
 if(value==='unavailable')return 'Consulta indisponível'
 return 'Não sincronizado'
}
export function formatRepositoryDate(value){
 if(!value)return 'Não disponível'
 const date=new Date(value)
 if(!Number.isFinite(date.getTime()))return 'Não disponível'
 return new Intl.DateTimeFormat('pt-BR',{dateStyle:'short',timeStyle:'short',timeZone:'America/Sao_Paulo'}).format(date)
}
