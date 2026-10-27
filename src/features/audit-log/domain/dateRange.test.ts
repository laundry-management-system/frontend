import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toInstantRange } from './dateRange.ts'

test('một ngày VN = [00:00+07, 00:00+07 ngày sau)', () => {
  assert.deepEqual(toInstantRange('2026-09-16', '2026-09-16'), {
    from: '2026-09-15T17:00:00.000Z',
    to: '2026-09-16T17:00:00.000Z',
  })
})

test('chỉ một đầu', () => {
  assert.deepEqual(toInstantRange('2026-09-16'), {
    from: '2026-09-15T17:00:00.000Z',
    to: undefined,
  })
  assert.deepEqual(toInstantRange(undefined, '2026-09-16'), {
    from: undefined,
    to: '2026-09-16T17:00:00.000Z',
  })
})

test('qua tháng', () => {
  assert.equal(toInstantRange('2026-09-30', '2026-09-30').to, '2026-09-30T17:00:00.000Z')
})
