import {test} from 'node:test'
import assert from 'node:assert/strict'
import {activityLabel,formatHubDate,eventLabels} from '../lib/activity-labels.mjs'
test('eventos empresariais têm rótulos claros',()=>{
 assert.equal(activityLabel('login'),'Entrou no Hub')
 assert.equal(activityLabel('client_created'),'Cadastrou um cliente')
 assert.equal(activityLabel('project_archived'),'Arquivou um projeto')
 assert.equal(activityLabel('task_status_changed'),'Alterou a etapa de uma tarefa')
})
test('eventos desconhecidos não revelam detalhes de implementação',()=>{
 assert.equal(activityLabel('sensitive_field'),'Atividade no Hub')
 assert.equal(Object.values(eventLabels).length,22)
})
test('horário exibido usa fuso de Brasília',()=>{
 const value=formatHubDate('2026-10-10T02:30:00.000Z')
 assert.ok(value.includes('09/10/2026'))
 assert.ok(value.includes('23:30'))
})
test('data ausente ou inválida é apresentada como não registrada',()=>{
 assert.equal(formatHubDate(null),'Ainda não registrado')
 assert.equal(formatHubDate('invalid'),'Ainda não registrado')
})
