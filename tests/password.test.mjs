import { test } from 'node:test'
import assert from 'node:assert/strict'
import { hashPassword,checkPassword,newSessionToken,sessionDigest,emailDigest } from '../lib/password.mjs'
test('strong secret hashed and validated; incorrect secret refused',async()=>{
  const password='SenhaSuperForte-1234-EsseTeste!'
  const hashed=await hashPassword(password)
  assert.notEqual(hashed,password)
  assert.match(hashed,/^scrypt-v1:/)
  assert.equal(await checkPassword(password,hashed),true)
  assert.equal(await checkPassword('SenhaIncorreta-1234',hashed),false)
})
test('new salts prevent equal hashes and short passwords are rejected',async()=>{
  assert.notEqual(await hashPassword('senha-correta-maior-que-12'),await hashPassword('senha-correta-maior-que-12'))
  await assert.rejects(hashPassword('12345'),/12/)
  assert.equal(await checkPassword('xyz','hash-malformado'),false)
})
test('opaque session tokens are unique and stored only as digests',()=>{
  const first=newSessionToken(),second=newSessionToken()
  assert.notEqual(first,second)
  assert.equal(first.length,43)
  assert.equal(sessionDigest(first).length,64)
  assert.notEqual(sessionDigest(first),sessionDigest(second))
})
test('login guard uses secret-bound irreversible email digest',()=>{
  const digest=emailDigest('usuario@example.com','segredo-nao-publico')
  assert.equal(digest.length,64)
  assert.notEqual(digest,emailDigest('usuario@example.com','outro-segredo'))
  assert.doesNotMatch(digest,/usuario/)
})
