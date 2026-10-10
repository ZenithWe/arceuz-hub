import {test} from 'node:test'
import assert from 'node:assert/strict'
import {normalizeTaskInput,knownTaskPriority,knownTaskStatus,isOverdue,formatTaskDate,isUuid,taskStatusName} from '../lib/task-fields.mjs'
const base={title:'Finalizar site',description:'Ajustar página de serviços',status:'todo',priority:'normal',due_on:'2026-10-15',assigned_to:'',project_id:''}
test('dados válidos normalizam referências vazias e prazo',()=>{
 const r=normalizeTaskInput(base);assert.equal(r.error,undefined);assert.equal(r.value.due_on,'2026-10-15');assert.equal(r.value.project_id,null)
})
test('rejeita título insuficiente, excesso de descrição e etapa inválida',()=>{
 for(const x of [{title:'oi'},{description:'a'.repeat(4001)},{status:'deleted'},{priority:'urgent'}])assert.ok(normalizeTaskInput({...base,...x}).error)
})
test('rejeita datas impossíveis e valores não UUID em relacionamentos',()=>{
 for(const x of [{due_on:'2026-02-30'},{due_on:'10/11/2026'},{assigned_to:"1' OR 1=1--"},{project_id:'not-a-uuid'}])assert.ok(normalizeTaskInput({...base,...x}).error)
})
test('atraso considera somente tarefas ainda pendentes',()=>{
 assert.equal(isOverdue('2026-10-10','doing','2026-10-11'),true)
 assert.equal(isOverdue('2026-10-10','done','2026-10-11'),false)
 assert.equal(isOverdue('2026-10-12','todo','2026-10-11'),false)
 assert.equal(isOverdue(null,'todo','2026-10-11'),false)
})
test('etapas, prioridades, datas e IDs são validados',()=>{
 assert.equal(knownTaskPriority('high'),true);assert.equal(knownTaskStatus('doing'),true)
 assert.equal(taskStatusName('done'),'Concluída');assert.equal(formatTaskDate('2026-10-09'),'09/10/2026')
 assert.equal(isUuid('00000000-0000-4000-8000-000000000001'),true);assert.equal(isUuid('abc'),false)
})
