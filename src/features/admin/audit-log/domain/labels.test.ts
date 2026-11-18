import assert from 'node:assert/strict'
import { test } from 'node:test'
import { actionLabel, actorName, entityLabel, entityTypeLabel, pageRangeText } from './labels.ts'

test('nhãn hành động và loại đối tượng, mã lạ giữ nguyên', () => {
  assert.equal(actionLabel('SETTING_UPDATED'), 'Đổi cài đặt')
  assert.equal(actionLabel('NEW_X'), 'NEW_X')
  assert.equal(entityTypeLabel('ORDER'), 'Đơn hàng')
})

test('actorName', () => {
  assert.equal(actorName({ userId: 0, fullName: 'system', username: 'system' }), 'Hệ thống')
  assert.equal(actorName({ userId: 3, fullName: null, username: 'nv03' }), 'nv03')
  assert.equal(actorName({ userId: 3, fullName: null, username: null }), '#3')
  assert.equal(actorName({ userId: 3, fullName: 'Trần Bình', username: 'nv03' }), 'Trần Bình')
})

test('entityLabel tách mã riêng, SETTING không có mã', () => {
  assert.deepEqual(entityLabel({ entityType: 'SETTING', entityId: 12 }), {
    label: 'Tham số',
    code: null,
  })
  assert.deepEqual(entityLabel({ entityType: 'USER', entityId: 5 }), {
    label: 'Tài khoản',
    code: '5',
  })
  assert.deepEqual(entityLabel({ entityType: 'AUTH', entityId: null }), {
    label: 'Xác thực',
    code: null,
  })
})

test('pageRangeText', () => {
  assert.equal(pageRangeText(1, 20, 20, 42), 'Hiển thị 1–20 / 42 bản ghi')
  assert.equal(pageRangeText(3, 20, 2, 42), 'Hiển thị 41–42 / 42 bản ghi')
})
