import { test } from 'node:test'
import assert from 'node:assert/strict'
import {normalizeRepositoryInput,normalizeRepositoryProject,repositorySyncLabel,formatRepositoryDate} from '../lib/repository-fields.mjs'
test('URLs válidos e usuário/repositório viram nome canônico',()=>{
 const a=normalizeRepositoryInput('https://github.com/ZenithWe/ARCEUZ-HUB')
 assert.deepEqual(a.value,{full_name:'zenithwe/arceuz-hub',html_url:'https://github.com/zenithwe/arceuz-hub'})
 assert.equal(normalizeRepositoryInput('ZenithWe/arceuz-hub.git').value.full_name,'zenithwe/arceuz-hub')
})
test('URLs externas, credenciais, caminhos extras, fragmentos e queries são bloqueados',()=>{
 for(const url of ['https://evil.com/owner/repo','http://github.com/owner/repo',
 'https://github.com/owner/repo/issues','https://github.com/owner/repo?x=1',
 'https://username:password@github.com/owner/repo','javascript:evil()','owner','../repo','owner/..'])
 assert.ok(normalizeRepositoryInput(url).error,url)
})
test('ID vinculado deve ser UUID válido ou vazio',()=>{
 assert.equal(normalizeRepositoryProject('').value,null)
 assert.equal(normalizeRepositoryProject('00000000-0000-4000-8000-000000000001').value,'00000000-0000-4000-8000-000000000001')
 assert.ok(normalizeRepositoryProject('other').error)
})
test('status e data não inventam atualizações',()=>{
 assert.equal(repositorySyncLabel('unavailable'),'Consulta indisponível')
 assert.equal(repositorySyncLabel('never'),'Não sincronizado')
 assert.equal(formatRepositoryDate(null),'Não disponível')
})
