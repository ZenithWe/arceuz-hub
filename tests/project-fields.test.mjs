import {test} from 'node:test'
import assert from 'node:assert/strict'
import {parseBRLCents,formatBRLInput,normalizeProjectURL,knownStatus,validISODate,statusName} from '../lib/project-fields.mjs'
test('valores BRL são convertidos sem erro de ponto flutuante',()=>{
  assert.equal(parseBRLCents('R$ 1.999,90'),199990)
  assert.equal(parseBRLCents('1999,9'),199990)
  assert.equal(parseBRLCents('0,01'),1)
  assert.equal(parseBRLCents(''),0)
  assert.equal(formatBRLInput('199990'),'1999,90')
})
test('valores inválidos ou inseguros são rejeitados',()=>{
  for(const value of ['12.30','-20,00','1,999','10,000','abc','90071992547409,92'])assert.equal(parseBRLCents(value),null)
})
test('links externos aceitam apenas HTTPS sem credenciais',()=>{
  assert.equal(normalizeProjectURL('https://arceuz.com'),'https://arceuz.com/')
  for(const text of ['javascript:alert(1)','http://arceuz.com','https://user:pass@arceuz.com','ftp://example.com','not a url'])assert.equal(normalizeProjectURL(text),null)
})
test('datas ISO são verificadas no calendário real',()=>{
  assert.equal(validISODate('2028-02-29'),true)
  assert.equal(validISODate('2027-02-29'),false)
  assert.equal(validISODate('2026-13-11'),false)
  assert.equal(validISODate(''),true)
})
test('status conhecidos podem ser exibidos com segurança',()=>{
  assert.equal(knownStatus('production'),true)
  assert.equal(knownStatus('deleted'),false)
  assert.equal(statusName('archived'),'Arquivado')
})
