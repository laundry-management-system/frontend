/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toCustomer, toCustomerOrder } from './mapper.ts'

test('toCustomer: customerCode → code, isVip null → false', () => {
  const customer = toCustomer({
    id: 12,
    customerCode: 'KH000012',
    fullName: 'Nguyễn Văn An',
    phone: '0901234567',
    address: null,
    note: null,
    isVip: null,
    status: 'ACTIVE',
    createdBy: 'nv01',
    createdAt: '2026-02-03T02:00:00Z',
    updatedAt: '2026-02-03T02:00:00Z',
  })
  assert.equal(customer.code, 'KH000012')
  assert.equal(customer.isVip, false)
})

test('toCustomerOrder: totalAmount dạng chuỗi → số', () => {
  const order = toCustomerOrder({
    id: 1,
    orderCode: 'LD-20260916-001',
    serviceName: 'Giặt sấy',
    totalAmount: '177750',
    status: 'COMPLETED',
    paymentStatus: 'PAID',
    receivedAt: '2026-09-16T01:00:00Z',
  })
  assert.equal(order.code, 'LD-20260916-001')
  assert.equal(order.totalAmount, 177750)
})
