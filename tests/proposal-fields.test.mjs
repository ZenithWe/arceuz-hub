import {test} from 'node:test'
import assert from 'node:assert/strict'
import {normalizeProposalInput,proposalStatusName,formatProposalMoney,formatProposalDate,isProposalId} from '../lib/proposal-fields.mjs'
const base={title:'Site de salão',scope:'Desenvolvimento de site responsivo com formulário de contato e galeria.',delivery_terms:'15 dias',payment_terms:'50% no início',notes:'',status:'draft',valid_until:'2026-11-01',amount:'2.490,90',client_id:'',project_id:''}
test('normaliza valores em centavos e campos opcionais',()=>{const r=normalizeProposalInput(base);assert.equal(r.value.amount_cents,249090);assert.equal(r.value.client_id,null)})
test('bloqueia valores inválidos',()=>{for(const amount of ['0','-10','1,999','abc',''])assert.ok(normalizeProposalInput({...base,amount}).error)})
test('rejeita títulos, escopos e IDs inválidos',()=>{for(const x of [{title:'a'},{scope:'curto'},{client_id:'abc'},{project_id:'xx'},{valid_until:'2026-02-30'},{status:'false'}])assert.ok(normalizeProposalInput({...base,...x}).error)})
test('formatadores pt-BR',()=>{assert.equal(proposalStatusName('sent'),'Enviada');assert.equal(formatProposalMoney(249090),'R$ 2.490,90');assert.equal(formatProposalDate('2026-11-01'),'01/11/2026');assert.equal(isProposalId('00000000-0000-4000-8000-000000000001'),true)})
