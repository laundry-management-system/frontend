/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { DOMAIN_STATUSES, statusOf } from './domainStatuses.ts'

test('đủ 25 trạng thái, (group,key) không trùng', () => {
  assert.equal(DOMAIN_STATUSES.length, 25)
  const keys = new Set(DOMAIN_STATUSES.map((s) => `${s.group}/${s.key}`))
  assert.equal(keys.size, 25)
})

test('statusOf', () => {
  assert.equal(statusOf('order', 'new').label, 'Mới nhận')
  assert.equal(statusOf('flag', 'late').solid, true)
  assert.deepEqual(
    DOMAIN_STATUSES.filter((s) => s.solid).map((s) => s.key),
    ['late', 'express'],
  )
  assert.throws(() => statusOf('x', 'y'), /Unknown status x\/y/)
})
