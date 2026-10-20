/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import {
  classifyLoginError,
  classifySetupPasswordError,
  formatCountdown,
  homePathFor,
  validateConfirmPassword,
  validateNewPassword,
} from './rules.ts'

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

test('validateNewPassword: 8–255 ký tự', () => {
  assert.equal(validateNewPassword(''), 'Vui lòng nhập mật khẩu')
  assert.equal(validateNewPassword('1234567'), 'Mật khẩu tối thiểu 8 ký tự')
  assert.equal(validateNewPassword('12345678'), null)
  assert.equal(validateNewPassword('a'.repeat(256)), 'Mật khẩu tối đa 255 ký tự')
})

test('validateConfirmPassword', () => {
  assert.equal(validateConfirmPassword('', 'matkhau123'), 'Vui lòng nhập lại mật khẩu')
  assert.equal(validateConfirmPassword('matkhau12', 'matkhau123'), 'Mật khẩu nhập lại không khớp')
  assert.equal(validateConfirmPassword('matkhau123', 'matkhau123'), null)
})

test('classifySetupPasswordError khớp câu chữ BE', () => {
  const err = (status: number, message = '') => ({ status, message })
  assert.equal(
    classifySetupPasswordError(err(400, 'Link không hợp lệ hoặc đã hết hạn')),
    'invalid-link',
  )
  assert.equal(
    classifySetupPasswordError(err(400, 'Tài khoản đã được kích hoạt')),
    'already-active',
  )
  assert.equal(classifySetupPasswordError(err(0, 'Không kết nối được máy chủ')), 'network')
  assert.equal(classifySetupPasswordError(err(500)), 'network')
  assert.equal(classifySetupPasswordError(err(400, 'Lỗi khác')), 'unknown')
})
