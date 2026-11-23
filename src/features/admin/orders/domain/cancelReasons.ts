/** Mirror enum BE CancelReason, đúng thứ tự danh mục. */
export const CANCEL_REASONS = [
  { code: 'CUSTOMER_CHANGED_MIND', label: 'Khách đổi ý' },
  { code: 'CUSTOMER_UNREACHABLE', label: 'Không liên lạc được khách' },
  { code: 'WRONG_ORDER_INFO', label: 'Sai thông tin đơn' },
  { code: 'OUT_OF_SERVICE_AREA', label: 'Ngoài khu vực phục vụ' },
  { code: 'DUPLICATE_ORDER', label: 'Trùng đơn' },
  { code: 'OTHER', label: 'Khác' },
] as const

export type CancelReasonCode = (typeof CANCEL_REASONS)[number]['code']
