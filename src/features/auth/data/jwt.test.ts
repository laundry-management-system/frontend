/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { decodeAccessToken } from './jwt.ts'

const token = (payload: object) =>
  ['eyJhbGciOiJIUzI1NiJ9', Buffer.from(JSON.stringify(payload)).toString('base64url'), 'sig'].join(
    '.',
  )

test('decodeAccessToken đọc sub và roles', () => {
  assert.deepEqual(decodeAccessToken(token({ sub: 'admin01', roles: ['ADMIN'] })), {
    username: 'admin01',
    roles: ['ADMIN'],
  })
})

test('decodeAccessToken giữ ký tự tiếng Việt', () => {
  assert.equal(
    decodeAccessToken(token({ sub: 'Nguyễn Văn Ánh', roles: ['STAFF'] }))?.username,
    'Nguyễn Văn Ánh',
  )
})

test('decodeAccessToken trả null khi token hỏng hoặc thiếu dữ liệu', () => {
  assert.equal(decodeAccessToken('rác'), null)
  assert.equal(decodeAccessToken(token({ sub: 'nv01' })), null)
  assert.equal(decodeAccessToken(token({ sub: 'nv01', roles: ['ROOT'] })), null)
  assert.equal(decodeAccessToken(token({ sub: '', roles: ['STAFF'] })), null)
})
