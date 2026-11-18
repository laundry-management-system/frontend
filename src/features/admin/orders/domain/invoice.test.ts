import assert from 'node:assert/strict'
import { test } from 'node:test'
import { buildInvoice } from './invoice.ts'
import type { OrderDetail, OrderLine, PaymentTxn } from './types'

const line = (over: Partial<OrderLine>) =>
  ({ itemType: 'Áo', unit: 'KG', quantity: 3, unitPrice: 45000, ...over }) as OrderLine

const order = {
  orderCode: 'LD-20261023-002',
  customerName: 'Khánh Ngọc',
  customerPhone: '0857140159',
  receivedAt: '2026-10-23T15:07:00Z',
  items: [
    line({}),
    line({ itemType: 'Rèm cửa', quantity: 2, billableQuantity: 3, unitPrice: 60000 }),
  ],
  subtotal: 315000,
  discountAmount: 15000,
  expressFee: 0,
  whitesFee: 20000,
  totalAmount: 320000,
} as OrderDetail

const txn = {
  invoiceNo: 'INV1',
  paidAt: '2026-10-25T09:00:00Z',
  method: 'CASH',
  referenceCode: null,
} as PaymentTxn

const extra = { shopName: 'Tiệm', hotline: '1900', confirmedByName: 'Admin 01' }

test('buildInvoice: dòng đồ và các khoản tiền', () => {
  const inv = buildInvoice(order, txn, extra)
  assert.deepEqual(
    inv.lines.map((l) => [l.index, l.name, l.quantity, l.lineTotal]),
    [
      [1, 'Áo', 3, 135000],
      [2, 'Rèm cửa', 3, 180000],
    ],
  )
  assert.deepEqual(
    [inv.subtotal, inv.discountAmount, inv.expressFee, inv.whitesFee, inv.totalAmount],
    [315000, 15000, 0, 20000, 320000],
  )
  assert.equal(inv.invoiceNo, 'INV1')
  assert.equal(inv.confirmedByName, 'Admin 01')
  assert.equal(inv.cash, null)
  assert.equal(inv.receiver, null)
})

test('buildInvoice: tiền mặt và người nhận', () => {
  const cash = { given: 400000, change: 80000 }
  const receiver = { name: 'Hoa', relation: 'Vợ' }
  const inv = buildInvoice(order, txn, { ...extra, cash, receiver })
  assert.deepEqual(inv.cash, cash)
  assert.deepEqual(inv.receiver, receiver)
})
