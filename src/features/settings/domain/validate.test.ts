import assert from 'node:assert/strict'
import { test } from 'node:test'
import { validateOpeningHours, validateSetting } from './validate.ts'

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
