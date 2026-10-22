/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import type { ServiceResponseDto } from './dto'
import { toService } from './mapper.ts'

const dto = (patch: Partial<ServiceResponseDto> = {}): ServiceResponseDto => ({
  id: 1,
  serviceCode: 'DV01',
  name: 'Giặt sấy',
  unit: 'KG',
  unitDisplayName: 'kg',
  currentPrice: 25000,
  standardHours: 24,
  expressSupported: true,
  expressSurcharge: 12500,
  expressHours: 6,
  status: 'ACTIVE',
  createdAt: '2026-10-20T00:00:00Z',
  updatedAt: '2026-10-20T00:00:00Z',
  ...patch,
})

test('toService: lấy mã đơn vị BE trả về, không dựa vào tên hiển thị', () => {
  assert.equal(toService(dto({ unit: 'PIECE', unitDisplayName: 'piece' })).unit, 'PIECE')
  assert.equal(toService(dto({ unit: 'PRODUCT', unitDisplayName: 'whatever' })).unit, 'PRODUCT')
})

test('toService: tiền dạng chuỗi → số, expressSupported null → false', () => {
  const s = toService(
    dto({ currentPrice: '25000', expressSurcharge: '12500', expressSupported: null }),
  )
  assert.equal(s.price, 25000)
  assert.equal(s.expressSurcharge, 12500)
  assert.equal(s.expressSupported, false)
  assert.equal(s.code, 'DV01')
})

test('toService: không có phụ phí giữ null', () => {
  assert.equal(toService(dto({ expressSurcharge: null })).expressSurcharge, null)
})
