// Pure helpers for the project forms; tested without framework dependencies.
export const statuses = Object.freeze([
  ['idea','Ideia'], ['planning','Planejamento'], ['development','Desenvolvimento'],
  ['review','Revisão'], ['production','Em produção'], ['paused','Pausado'],
  ['completed','Concluído'], ['archived','Arquivado'],
])
export function knownStatus(value) { return statuses.some(([key])=>key===value) }
export function statusName(value) { return statuses.find(([key])=>key===value)?.[1]??'Indefinido' }
export function parseBRLCents(input) {
  if(typeof input!=='string') return null
  const text=input.trim().replace(/^R\$\s*/,'').replace(/\s/g,'')
  if(!text) return 0
  // Both 1999,95 and 1.999,95 are permitted; no floats / silent truncation.
  let whole, fraction
  if(/^\d{1,3}(?:\.\d{3})+(?:,\d{1,2})?$/.test(text)){
    const parts=text.split(','); whole=parts[0].replaceAll('.','');fraction=parts[1]??''
  }else if(/^\d+(?:,\d{1,2})?$/.test(text)){
    const parts=text.split(',');whole=parts[0];fraction=parts[1]??''
  }else return null
  const cents=BigInt(whole)*100n + BigInt((fraction+'00').slice(0,2))
  return cents <= BigInt(Number.MAX_SAFE_INTEGER) ? Number(cents) : null
}
export function formatBRLInput(cents){
  if(!Number.isSafeInteger(Number(cents)) || Number(cents)<0) return '0,00'
  const value=BigInt(cents)
  return `${(value/100n).toString()},${(value%100n).toString().padStart(2,'0')}`
}
export function normalizeProjectURL(text) {
  if(typeof text !== 'string') return null
  const value=text.trim()
  if(!value) return ''
  if(value.length>500) return null
  try {
    const url=new URL(value)
    if(url.protocol!=='https:' || !url.hostname || url.username || url.password) return null
    return url.href
  } catch {return null}
}
export function validISODate(value){
  if(value==='') return true
  if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false
  const d=new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(d.valueOf()) && d.toISOString().startsWith(value)
}
