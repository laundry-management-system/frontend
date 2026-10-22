/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { toFormValues } from '../domain/rules.ts'
import type { Service, ServiceFormValues } from '../domain/types'
import { serviceFormSchema } from './schemas.ts'

const service: Service = {
  id: 1,
  code: 'DV01',
  name: 'Giặt sấy',
  unit: 'KG',
  price: 25000,
  standardHours: 24,
  expressSupported: true,
  expressSurcharge: 12500,
  expressHours: 6,
  status: 'ACTIVE',
}

const form = (patch: Partial<ServiceFormValues> = {}): ServiceFormValues => ({
  ...toFormValues(service),
  ...patch,
})

/** Lỗi đầu tiên của mỗi field, giống cách schemaResolver gắn lỗi vào form */
function errorsOf(values: ServiceFormValues) {
  const result = serviceFormSchema.safeParse(values)
  const errors: Record<string, string> = {}
  for (const issue of result.error?.issues ?? []) {
    const key = issue.path.join('.')
    errors[key] ??= issue.message
  }
  return errors
}

test('serviceFormSchema: form hợp lệ', () => {
  assert.deepEqual(errorsOf(form()), {})
  assert.deepEqual(
    errorsOf(form({ expressSupported: false, expressSurcharge: '', expressHours: '' })),
    {},
  )
})

test('serviceFormSchema: trường bắt buộc và giới hạn', () => {
  assert.equal(errorsOf(form({ name: '  ' })).name, 'Vui lòng nhập tên dịch vụ')
  assert.equal(errorsOf(form({ name: 'a'.repeat(101) })).name, 'Tên dịch vụ tối đa 100 ký tự')
  assert.equal(errorsOf(form({ unit: null })).unit, 'Vui lòng chọn đơn vị tính')
  assert.equal(errorsOf(form({ price: '' })).price, 'Vui lòng nhập đơn giá')
  assert.equal(errorsOf(form({ price: -1 })).price, 'Đơn giá không được âm')
  assert.equal(errorsOf(form({ price: 0 })).price, undefined)
  assert.equal(errorsOf(form({ standardHours: 0 })).standardHours, 'Thời gian phải lớn hơn 0 giờ')
})

test('serviceFormSchema: giặt nhanh', () => {
  assert.equal(
    errorsOf(form({ expressSurcharge: '' })).expressSurcharge,
    'Vui lòng nhập phụ phí giặt nhanh',
  )
  assert.equal(
    errorsOf(form({ expressHours: '' })).expressHours,
    'Vui lòng nhập thời gian giặt nhanh',
  )
  // BR-C06
  assert.equal(
    errorsOf(form({ expressHours: 24 })).expressHours,
    'Thời gian giặt nhanh phải ngắn hơn thời gian chuẩn',
  )
})
