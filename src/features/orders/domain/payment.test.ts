import assert from 'node:assert/strict'
import { test } from 'node:test'
import { changeDue, checkoutMode, confirmedTxn, discrepancyOf } from './payment.ts'
import type { PaymentTxn } from './types'

test('checkoutMode', () => {
  assert.equal(checkoutMode({ status: 'COMPLETED', paymentStatus: 'UNPAID' }), 'checkout')
  assert.equal(checkoutMode({ status: 'COMPLETED', paymentStatus: 'PAID' }), 'handover')
  assert.equal(checkoutMode({ status: 'PROCESSING', paymentStatus: 'UNPAID' }), null)
  assert.equal(checkoutMode({ status: 'DELIVERED', paymentStatus: 'PAID' }), null)
})

test('changeDue', () => {
  assert.equal(changeDue(177750, 200000), 22250)
  assert.equal(changeDue(177750, 100000), null)
  assert.equal(changeDue(177750, ''), null)
  assert.equal(changeDue(177750, 177750), 0)
})

test('discrepancyOf', () => {
  assert.deepEqual(discrepancyOf(177750, 167750), { kind: 'short', diff: 10000 })
  assert.deepEqual(discrepancyOf(177750, 180000), { kind: 'over', diff: 2250 })
  assert.deepEqual(discrepancyOf(177750, 177750), { kind: 'none', diff: 0 })
})

test('confirmedTxn', () => {
  const txn = (id: number, status: PaymentTxn['status']) => ({ id, status }) as PaymentTxn
  assert.equal(confirmedTxn([]), null)
  assert.equal(confirmedTxn([txn(1, 'VOIDED')]), null)
  assert.equal(confirmedTxn([txn(2, 'CONFIRMED'), txn(1, 'VOIDED')])?.id, 2)
})
