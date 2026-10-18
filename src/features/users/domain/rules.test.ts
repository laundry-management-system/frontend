/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateFullName, validatePassword, validatePhone, validateUsername } from './rules.ts'

test('validateFullName', () => {
  assert.equal(validateFullName('Nguyễn Văn A'), null)
  assert.equal(validateFullName('   '), 'Vui lòng nhập họ tên')
  assert.equal(validateFullName('a'.repeat(51)), 'Họ tên tối đa 50 ký tự')
})

test('validatePhone', () => {
  assert.equal(validatePhone('0912345678'), null)
  assert.equal(validatePhone(''), 'Vui lòng nhập số điện thoại')
  assert.equal(validatePhone('912345678'), 'Số điện thoại gồm 10 số, bắt đầu bằng 0')
  assert.equal(validatePhone('0912'), 'Số điện thoại gồm 10 số, bắt đầu bằng 0')
})

test('validateUsername: tối thiểu 10 ký tự', () => {
  assert.equal(validateUsername('nhanvien01'), null) // 10 ký tự
  assert.equal(validateUsername('nhanvien0'), 'Tên đăng nhập tối thiểu 10 ký tự') // 9
  assert.equal(validateUsername(''), 'Vui lòng nhập tài khoản')
  assert.equal(validateUsername('a'.repeat(51)), 'Tên đăng nhập tối đa 50 ký tự')
})

test('validatePassword: tối thiểu 8 ký tự', () => {
  assert.equal(validatePassword('matkhau1'), null) // 8
  assert.equal(validatePassword('1234567'), 'Mật khẩu tối thiểu 8 ký tự') // 7
  assert.equal(validatePassword(''), 'Vui lòng nhập mật khẩu tạm')
})
