export const clientStatuses = [['lead','Lead'],['negociacao','Em negociação'],['ativo','Ativo'],['inativo','Inativo']]
export function knownClientStatus(value) {return clientStatuses.some(([key])=>key===value)}
export function clientStatusName(value) {return clientStatuses.find(([key])=>key===value)?.[1]??'Não identificado'}
export function normalizeClientInput(raw) {
  const get=key=>String(raw[key]??'').trim()
  const name=get('name'),contact_name=get('contact_name'),email=get('email').toLowerCase()
  const phone=get('phone'),whatsapp=get('whatsapp'),status=get('status'),notes=get('notes')
  const rawWebsite=get('website')
  if(name.length<2||name.length>120)return {error:'O nome precisa ter de 2 a 120 caracteres.'}
  if(contact_name.length>120||notes.length>5000)return {error:'O contato ou as observações estão muito longos.'}
  if(email.length>254||(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)))return {error:'Informe um e-mail válido.'}
  for(const value of [phone,whatsapp]) {
    const digits=value.replace(/\D/g,'')
    if(value.length>40 || (value && (digits.length<8||digits.length>15)))return {error:'Telefone ou WhatsApp inválido.'}
  }
  if(!knownClientStatus(status))return {error:'Status de cliente inválido.'}
  let website=null
  if(rawWebsite){
    try{const u=new URL(rawWebsite);if(u.protocol!=='https:'||u.username||u.password||rawWebsite.length>500)return {error:'O site deve usar HTTPS, sem usuário ou senha.'};website=u.toString()}
    catch{return {error:'Informe um endereço HTTPS válido.'}}
  }
  return {value:{name,contact_name,email,phone,whatsapp,website,status,notes}}
}
