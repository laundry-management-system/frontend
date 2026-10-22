/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  expressParts,
  isPriceChanged,
  priceDelta,
  toFormValues,
  toServicePayload,
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

test('expressParts', () => {
  assert.deepEqual(expressParts(service), { surcharge: '+12.500đ/kg', hours: '6 giờ' })
  assert.equal(expressParts({ ...service, expressSupported: false }), null)
  assert.equal(expressParts({ ...service, unit: null })?.surcharge, '+12.500đ/đơn vị')
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

test('priceDelta: tăng, giảm, giá cũ 0', () => {
  assert.deepEqual(priceDelta(28000, 34000), { direction: 'up', label: '+6.000đ · +21,4%' })
  assert.deepEqual(priceDelta(25000, 20000), { direction: 'down', label: '−5.000đ · −20%' })
  assert.deepEqual(priceDelta(0, 15000), { direction: 'up', label: '+15.000đ' })
})
