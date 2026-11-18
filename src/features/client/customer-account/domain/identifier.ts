const PHONE = /^0\d{9}$/

/** Cùng quy tắc với BE: bỏ khoảng trắng, dấu chấm, gạch ngang; +84/84 đầu số đổi thành 0. */
export function normalizePhone(input: string): string | null {
  let digits = input.replace(/[\s.-]/g, '')
  if (digits.startsWith('+84')) digits = `0${digits.slice(3)}`
  else if (digits.startsWith('84') && digits.length === 11) digits = `0${digits.slice(2)}`
  return PHONE.test(digits) ? digits : null
}

export function isEmail(input: string): boolean {
  return input.includes('@')
}
