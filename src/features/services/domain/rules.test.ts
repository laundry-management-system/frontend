/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  expressLabel,
  isPriceChanged,
  toFormValues,
  toServicePayload,
  validateServiceForm,
} from './rules.ts'
import type { Service, ServiceFormValues } from './types'

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

test('expressLabel', () => {
  assert.equal(expressLabel(service), 'Có · +12.500đ/kg · 6 giờ')
  assert.equal(expressLabel({ ...service, expressSupported: false }), 'Không')
  assert.equal(expressLabel({ ...service, unit: null }), 'Có · +12.500đ/đơn vị · 6 giờ')
})

test('validateServiceForm: form hợp lệ', () => {
  assert.deepEqual(validateServiceForm(form()), {})
  assert.deepEqual(
    validateServiceForm(form({ expressSupported: false, expressSurcharge: '', expressHours: '' })),
    {},
  )
})

test('validateServiceForm: trường bắt buộc và giới hạn', () => {
  assert.equal(validateServiceForm(form({ name: '  ' })).name, 'Vui lòng nhập tên dịch vụ')
  assert.equal(
    validateServiceForm(form({ name: 'a'.repeat(101) })).name,
    'Tên dịch vụ tối đa 100 ký tự',
  )
  assert.equal(validateServiceForm(form({ unit: null })).unit, 'Vui lòng chọn đơn vị tính')
  assert.equal(validateServiceForm(form({ price: '' })).price, 'Vui lòng nhập đơn giá')
  assert.equal(validateServiceForm(form({ price: -1 })).price, 'Đơn giá không được âm')
  assert.equal(validateServiceForm(form({ price: 0 })).price, undefined)
  assert.equal(
    validateServiceForm(form({ standardHours: 0 })).standardHours,
    'Thời gian phải lớn hơn 0 giờ',
  )
})

test('validateServiceForm: giặt nhanh', () => {
  assert.equal(
    validateServiceForm(form({ expressSurcharge: '' })).expressSurcharge,
    'Vui lòng nhập phụ phí giặt nhanh',
  )
  assert.equal(
    validateServiceForm(form({ expressHours: '' })).expressHours,
    'Vui lòng nhập thời gian giặt nhanh',
  )
  // BR-C06
  assert.equal(
    validateServiceForm(form({ expressHours: 24 })).expressHours,
    'Thời gian giặt nhanh phải ngắn hơn thời gian chuẩn',
  )
})

test('toServicePayload: tắt giặt nhanh thì xóa phụ phí và thời gian', () => {
  const payload = toServicePayload(form({ name: ' Giặt sấy ', expressSupported: false }))
  assert.equal(payload.name, 'Giặt sấy')
  assert.equal(payload.expressSurcharge, null)
  assert.equal(payload.expressHours, null)
  assert.equal(toServicePayload(form()).expressSurcharge, 12500)
})

test('isPriceChanged', () => {
  assert.equal(isPriceChanged(service, form()), false)
  assert.equal(isPriceChanged(service, form({ price: 28000 })), true)
  assert.equal(isPriceChanged(undefined, form({ price: 28000 })), false)
})
