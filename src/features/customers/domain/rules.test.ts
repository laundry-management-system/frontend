/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  formatPhone,
  isDuplicatePhoneError,
  isOpenOrder,
  looksLikePhone,
  normalizePhone,
  summarizeOrders,
  toCustomerPayload,
  validateCustomerForm,
} from './rules.ts'
import type { CustomerOrder } from './types'

const form = (patch = {}) => ({
  fullName: 'Nguyễn Văn An',
  phone: '0901234567',
  address: '',
  note: '',
  ...patch,
})

test('normalizePhone bỏ khoảng trắng, dấu chấm, gạch ngang', () => {
  assert.equal(normalizePhone('0901 234 567'), '0901234567')
  assert.equal(normalizePhone('0901.234.567'), '0901234567')
  assert.equal(normalizePhone('0901-234-567'), '0901234567')
})

test('looksLikePhone: chỉ chữ số mới là SĐT', () => {
  assert.equal(looksLikePhone('4567'), true)
  assert.equal(looksLikePhone('0901 234'), true)
  assert.equal(looksLikePhone('Nguyễn'), false)
  assert.equal(looksLikePhone(''), false)
})

test('validateCustomerForm', () => {
  assert.deepEqual(validateCustomerForm(form()), {})
  assert.deepEqual(validateCustomerForm(form({ phone: '0901 234 567' })), {})
  assert.equal(validateCustomerForm(form({ fullName: '  ' })).fullName, 'Vui lòng nhập họ tên')
  assert.equal(
    validateCustomerForm(form({ fullName: 'a'.repeat(101) })).fullName,
    'Họ tên tối đa 100 ký tự',
  )
  assert.equal(validateCustomerForm(form({ phone: '' })).phone, 'Vui lòng nhập số điện thoại')
  assert.equal(
    validateCustomerForm(form({ phone: '090123456' })).phone,
    'Số điện thoại gồm 10 số, bắt đầu bằng 0',
  )
  assert.equal(
    validateCustomerForm(form({ phone: '1901234567' })).phone,
    'Số điện thoại gồm 10 số, bắt đầu bằng 0',
  )
  assert.equal(
    validateCustomerForm(form({ address: 'a'.repeat(256) })).address,
    'Địa chỉ tối đa 255 ký tự',
  )
  assert.equal(
    validateCustomerForm(form({ note: 'a'.repeat(501) })).note,
    'Ghi chú tối đa 500 ký tự',
  )
})

test('toCustomerPayload: trim, chuẩn hóa SĐT, chuỗi rỗng → null', () => {
  assert.deepEqual(
    toCustomerPayload(form({ fullName: ' An ', phone: '0901 234 567', address: '  ', note: 'x' })),
    { fullName: 'An', phone: '0901234567', address: null, note: 'x' },
  )
})

test('isDuplicatePhoneError', () => {
  const message = "Phone number '0901234567' is already registered in the system (BR-B01)"
  assert.equal(isDuplicatePhoneError({ status: 400, message }), true)
  assert.equal(isDuplicatePhoneError({ status: 500, message }), false)
  assert.equal(isDuplicatePhoneError({ status: 400, message: 'Dữ liệu không hợp lệ' }), false)
})

test('isOpenOrder: chỉ Đã giao và Đã hủy là đóng', () => {
  assert.equal(isOpenOrder('RECEIVED'), true)
  assert.equal(isOpenOrder('PROCESSING'), true)
  assert.equal(isOpenOrder('COMPLETED'), true)
  assert.equal(isOpenOrder('DELIVERED'), false)
  assert.equal(isOpenOrder('CANCELLED'), false)
})

const order = (patch: Partial<CustomerOrder>): CustomerOrder => ({
  id: 1,
  code: 'LD-20260916-001',
  receivedAt: '2026-09-16T01:00:00Z',
  serviceName: 'Giặt sấy',
  totalAmount: 100000,
  status: 'DELIVERED',
  paymentStatus: 'PAID',
  ...patch,
})

test('summarizeOrders: chỉ cộng đơn đã thanh toán, không hủy', () => {
  const result = summarizeOrders([
    order({ totalAmount: 100000 }),
    order({ totalAmount: 50000, paymentStatus: 'UNPAID' }),
    order({ totalAmount: 70000, status: 'CANCELLED' }),
  ])
  assert.equal(result.totalSpent, 100000)
})

test('summarizeOrders: dịch vụ nhiều nhất, hòa thì lấy đơn mới hơn', () => {
  assert.equal(
    summarizeOrders([
      order({ serviceName: 'Ủi' }),
      order({ serviceName: 'Giặt khô' }),
      order({ serviceName: 'Giặt khô' }),
    ]).topService,
    'Giặt khô',
  )
  assert.equal(
    summarizeOrders([order({ serviceName: 'Ủi' }), order({ serviceName: 'Giặt sấy' })]).topService,
    'Ủi',
  )
})

test('summarizeOrders: không có đơn', () => {
  assert.deepEqual(summarizeOrders([]), { totalSpent: 0, topService: null })
})

test('formatPhone: 4-3-3 như mockup', () => {
  assert.equal(formatPhone('0901234567'), '0901 234 567')
  assert.equal(formatPhone('123'), '123')
})
