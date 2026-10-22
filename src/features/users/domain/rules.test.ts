/// <reference types="node" />
import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateEmail, validateFullName, validatePhone } from './rules.ts'

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

test('validateEmail', () => {
  assert.equal(validateEmail('ngoc@example.com'), null)
  assert.equal(validateEmail('  ngoc@example.com  '), null)
  assert.equal(validateEmail(''), 'Vui lòng nhập email')
  assert.equal(validateEmail('abc'), 'Email không đúng định dạng')
  assert.equal(validateEmail('a@b'), 'Email không đúng định dạng')
  assert.equal(validateEmail('a b@c.d'), 'Email không đúng định dạng')
})
