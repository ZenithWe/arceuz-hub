import {test} from 'node:test'
import assert from 'node:assert/strict'
import {parseFinanceEntry,formatMoney,formatDate,isPastDue} from '../lib/finance-fields.mjs'
const example={title:'Criação do site',direction:'income',status:'pending',amount:'1.249,90',category:'Website',method:'Pix',reference:'',notes:'',due_on:'2026-11-10',paid_on:'',competence_on:'2026-11-01',project_id:''}
test('converte BRL para centavos e preserva data de competência',()=>{
 const r=parseFinanceEntry(example)
 assert.equal(r.error,undefined)
 assert.equal(r.value.amount_cents,124990)
 assert.equal(r.value.competence_on,'2026-11-01')
 assert.equal(r.value.paid_on,null)
})
test('exige valor monetário positivo sem arredondamentos',()=>{
 for(const amount of ['','0','0,00','1,999','R$ -500,00','99999999999999999'])
  assert.ok(parseFinanceEntry({...example,amount}).error,'value: '+amount)
})
test('conclusão exige data, pendência não aceita data de pagamento',()=>{
 assert.ok(parseFinanceEntry({...example,status:'paid'}).error)
 assert.ok(parseFinanceEntry({...example,status:'pending',paid_on:'2026-11-11'}).error)
 const done=parseFinanceEntry({...example,status:'paid',paid_on:'2026-11-11'})
 assert.equal(done.value.paid_on,'2026-11-11')
})
test('rejeita status, tipos, projetos e datas inválidas',()=>{
 for(const x of [{direction:'unknown'},{status:'refunded'},{due_on:'2026-02-30'},{project_id:'invalid'},{title:'X'}])
  assert.ok(parseFinanceEntry({...example,...x}).error)
})
test('valores e datas são exibidos no formato do Brasil',()=>{
 assert.equal(formatMoney(124990),'R$ 1.249,90')
 assert.equal(formatMoney(-5999),'-R$ 59,99')
 assert.equal(formatDate('2026-10-09'),'09/10/2026')
})
test('apenas lançamentos pendentes vencidos são atrasados',()=>{
 assert.equal(isPastDue({status:'pending',due_on:'2026-10-08'},'2026-10-09'),true)
 assert.equal(isPastDue({status:'paid',due_on:'2026-10-08'},'2026-10-09'),false)
})
