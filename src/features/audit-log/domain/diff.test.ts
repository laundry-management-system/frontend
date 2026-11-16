import assert from 'node:assert/strict'
import { test } from 'node:test'
import { diffFields } from './diff.ts'

test('so từng trường, đánh dấu trường đổi', () => {
  assert.deepEqual(diffFields({ a: '5', b: 1 }, { a: '3', b: 1 }), [
    { key: 'a', old: '5', new: '3', changed: true, masked: false },
    { key: 'b', old: '1', new: '1', changed: false, masked: false },
  ])
})

test('thiếu một bên hiện —', () => {
  assert.deepEqual(diffFields(null, { a: 'x' }), [
    { key: 'a', old: '—', new: 'x', changed: true, masked: false },
  ])
  assert.deepEqual(diffFields(null, null), [])
})

test('che trường nhạy cảm nhưng vẫn biết có đổi', () => {
  const [hash, token] = diffFields(
    { passwordHash: 'a', resetToken: 't' },
    { passwordHash: 'b', resetToken: 't' },
  )
  assert.deepEqual(hash, {
    key: 'passwordHash',
    old: '••••••',
    new: '••••••',
    changed: true,
    masked: true,
  })
  assert.equal(token.masked, true)
  assert.equal(token.changed, false)
})

test('object in JSON, null/undefined thành —, key mới nằm sau', () => {
  assert.deepEqual(diffFields({ a: { x: 1 }, b: null }, { a: { x: 1 }, c: 2 }), [
    { key: 'a', old: '{"x":1}', new: '{"x":1}', changed: false, masked: false },
    { key: 'b', old: '—', new: '—', changed: false, masked: false },
    { key: 'c', old: '—', new: '2', changed: true, masked: false },
  ])
})
