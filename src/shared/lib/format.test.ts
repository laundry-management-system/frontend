/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { formatDate, formatMoney } from './format.ts'

test('formatMoney theo DS: 185.000đ', () => {
  assert.equal(formatMoney(185000), '185.000đ')
  assert.equal(formatMoney(0), '0đ')
  assert.equal(formatMoney(3250000), '3.250.000đ')
})

test('formatDate: DD/MM/YYYY', () => {
  assert.equal(formatDate('2026-02-03T10:00:00'), '03/02/2026')
})
