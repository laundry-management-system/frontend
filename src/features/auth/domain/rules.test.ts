/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { classifyLoginError, formatCountdown, homePathFor } from './rules.ts'

test('homePathFor: Chủ tiệm về Tổng quan, Nhân viên về Danh sách công việc', () => {
  assert.equal(homePathFor(['ADMIN']), '/')
  assert.equal(homePathFor(['STAFF']), '/work-list')
  assert.equal(homePathFor(['STAFF', 'ADMIN']), '/')
})

const err = (status: number, message = '', fieldErrors: Record<string, string> = {}) => ({
  status,
  message,
  fieldErrors,
})

test('classifyLoginError khớp câu chữ BE hiện tại', () => {
  assert.equal(classifyLoginError(err(400, 'Tên đăng nhập hoặc mật khẩu không đúng.')), 'invalid')
  assert.equal(
    classifyLoginError(
      err(
        400,
        'Tài khoản đã bị khóa do đăng nhập thất bại quá nhiều lần. Vui lòng thử lại sau 15 phút.',
      ),
    ),
    'locked',
  )
  assert.equal(classifyLoginError(err(400, 'Tài khoản đã bị vô hiệu hóa')), 'disabled')
  assert.equal(
    classifyLoginError(
      err(400, 'Dữ liệu không hợp lệ', { username: 'Tên đăng nhập không được bỏ trống' }),
    ),
    'validation',
  )
})

test('classifyLoginError: mất mạng / lỗi máy chủ không bị báo là sai mật khẩu', () => {
  assert.equal(classifyLoginError(err(0, 'Không kết nối được máy chủ')), 'network')
  assert.equal(classifyLoginError(err(500)), 'network')
  assert.equal(classifyLoginError(err(401)), 'invalid')
})

test('formatCountdown hiển thị mm:ss', () => {
  assert.equal(formatCountdown(900_000), '15:00')
  assert.equal(formatCountdown(61_000), '01:01')
  assert.equal(formatCountdown(500), '00:01')
  assert.equal(formatCountdown(-1), '00:00')
})
