import {test} from 'node:test'
import assert from 'node:assert/strict'
import {aiModes,knownAiMode,aiModeLabel,normalizeAiMessage,conversationTitle,formatAiDate} from '../lib/ai-modes.mjs'
test('seis modos permitidos e rótulos disponíveis',()=>{assert.equal(aiModes.length,6);for(const [k,n] of aiModes){assert.equal(knownAiMode(k),true);assert.equal(aiModeLabel(k),n)}assert.equal(knownAiMode('bad'),false)})
test('valida texto e tamanho',()=>{assert.equal(normalizeAiMessage('  Olá equipe  ').value,'Olá equipe');for(const x of ['','a',null,{},'x'.repeat(4501)])assert.ok(normalizeAiMessage(x).error)})
test('título é normalizado e limitado',()=>{assert.equal(conversationTitle('A  B'),'A B');assert.ok(conversationTitle('x'.repeat(400)).length<=100)})
test('datas seguem fuso de Brasília',()=>{assert.equal(formatAiDate('bad'),'Sem data');assert.ok(formatAiDate('2026-10-10T02:00:00Z').includes('09/10'))})
