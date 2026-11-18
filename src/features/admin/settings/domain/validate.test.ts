import assert from 'node:assert/strict'
import { test } from 'node:test'
import { normalizeStorePhone, validateOpeningHours, validateSetting } from './validate.ts'

test('TIME phải đúng HH:mm hai chữ số', () => {
  assert.equal(validateSetting('TIME', '08:00'), null)
  assert.equal(validateSetting('TIME', '23:59'), null)
  for (const bad of ['8:00', '24:00', '12:60', '', 'ab:cd']) {
    assert.notEqual(validateSetting('TIME', bad), null, bad)
  }
})

test('POSITIVE_INT và BANK phải > 0', () => {
  assert.equal(validateSetting('POSITIVE_INT', '7'), null)
  assert.equal(validateSetting('BANK', '970436'), null)
  for (const bad of ['0', '-1', '1.5', 'abc', '']) {
    assert.notEqual(validateSetting('POSITIVE_INT', bad), null, bad)
    assert.notEqual(validateSetting('BANK', bad), null, bad)
  }
})

test('NON_NEGATIVE_INT cho phép 0', () => {
  assert.equal(validateSetting('NON_NEGATIVE_INT', '0'), null)
  assert.equal(validateSetting('NON_NEGATIVE_INT', '80000'), null)
  assert.notEqual(validateSetting('NON_NEGATIVE_INT', '-1'), null)
  assert.notEqual(validateSetting('NON_NEGATIVE_INT', '1.5'), null)
})

test('STRING không được rỗng', () => {
  assert.notEqual(validateSetting('STRING', '  '), null)
  assert.equal(validateSetting('STRING', 'x'), null)
})

test('giờ đóng cửa phải sau giờ mở cửa', () => {
  assert.equal(validateOpeningHours('07:00', '21:00'), null)
  assert.notEqual(validateOpeningHours('21:00', '07:00'), null)
  assert.notEqual(validateOpeningHours('08:00', '08:00'), null)
  assert.equal(validateOpeningHours('8:00', '07:00'), null)
})

test('normalizeStorePhone bỏ dấu và đổi +84/84 về 0', () => {
  for (const raw of [
    '0901.234.567',
    '0901-234-567',
    '+84 901 234 567',
    '84901234567',
    ' 0901234567 ',
  ])
    assert.equal(normalizeStorePhone(raw), '0901234567', raw)
})

test('PHONE: rỗng hợp lệ, còn lại phải 10 số bắt đầu bằng 0', () => {
  assert.equal(validateSetting('PHONE', ''), null)
  assert.equal(validateSetting('PHONE', '+84 901 234 567'), null)
  for (const bad of ['090123456', '1901234567', '09012345678', 'abc'])
    assert.equal(
      validateSetting('PHONE', bad),
      'Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0',
      bad,
    )
})
