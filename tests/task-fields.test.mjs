
import {test} from 'node:test'
import assert from 'node:assert/strict'
import {parseTaskFields,isTaskDate,taskStatusName,taskPriorityName,knownTaskStatus,isUUID} from '../lib/task-fields.mjs'
const sample={title:'Atualizar landing page',description:'Alterar o layout e testar.',priority:'high',status:'todo',due_on:'2026-10-30',assigned_to:'',project_id:''}
test('validar tarefa e campos opcionais',()=>{const r=parseTaskFields(sample);assert.equal(r.error,undefined);assert.equal(r.value.assigned_to,null);assert.equal(r.value.project_id,null)})
test('título, descrição e enum não podem ser inválidos',()=>{for(const c of [{title:'ok'},{description:'x'.repeat(3001)},{priority:'urgente'},{status:'publico'}])assert.ok(parseTaskFields({...sample,...c}).error)})
test('datas precisam existir no calendário',()=>{assert.equal(isTaskDate('2026-02-30'),false);assert.equal(isTaskDate('2028-02-29'),true);assert.equal(isTaskDate('2026-13-11'),false);assert.equal(isTaskDate('2026-11-23'),true)})
test('identificadores de responsáveis e projetos precisam ser UUIDs',()=>{assert.ok(parseTaskFields({...sample,project_id:'admin'}).error);assert.ok(parseTaskFields({...sample,assigned_to:'../../etc'}).error);assert.equal(isUUID('550e8400-e29b-41d4-a716-446655440000'),true)})
test('nomes de status e prioridades são consistentes',()=>{assert.equal(taskStatusName('review'),'Em revisão');assert.equal(taskPriorityName('low'),'Baixa');assert.equal(knownTaskStatus('wrong'),false)})
test('entrada contendo número em vez de string não pode ser transformada em título',()=>{assert.ok(parseTaskFields({...sample,title:8888}).error)})
