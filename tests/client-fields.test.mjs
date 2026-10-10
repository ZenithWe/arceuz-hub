import {test} from 'node:test'
import assert from 'node:assert/strict'
import {normalizeClientInput,clientStatusName,knownClientStatus} from '../lib/client-fields.mjs'
const base={name:'Pizzaria Boa Massa',contact_name:'Ana',email:'ana@example.com',phone:'(31) 3333-0000',whatsapp:'(31) 99999-1111',website:'https://example.com',status:'lead',notes:''}
test('cadastro aceita dados válidos e normaliza e-mail e endereço',()=>{
 const result=normalizeClientInput({...base,email:' ANA@Example.com  '})
 assert.equal(result.error,undefined)
 assert.equal(result.value.email,'ana@example.com')
 assert.equal(result.value.website,'https://example.com/')
})
test('nome obrigatório, e-mail inválido e status desconhecido são rejeitados',()=>{
 for(const update of [{name:'A'},{email:'invalido'},{status:'admin'}])assert.ok(normalizeClientInput({...base,...update}).error)
})
test('não aceita sites sem HTTPS, credenciais em URL ou código javascript',()=>{
 for(const site of ['http://example.com','javascript:alert(1)','https://abc:pwd@example.com'])assert.ok(normalizeClientInput({...base,website:site}).error)
})
test('telefones com formato insuficiente e anotações exageradas são rejeitados',()=>{
 assert.ok(normalizeClientInput({...base,phone:'123'}).error)
 assert.ok(normalizeClientInput({...base,notes:'x'.repeat(5001)}).error)
})
test('etapas comerciais conhecidas retornam rótulos de exibição',()=>{
 assert.equal(knownClientStatus('ativo'),true)
 assert.equal(knownClientStatus('suspenso'),false)
 assert.equal(clientStatusName('negociacao'),'Em negociação')
})
