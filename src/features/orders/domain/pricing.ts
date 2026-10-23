import type { OrderLine, OrderType, PricingService, Totals } from './types'

/** KL/SL tính tiền = max(thực tế, tối thiểu); dòng chưa nhập số thì 0. */
export const billable = (line: OrderLine) =>
  line.quantity === '' ? 0 : Math.max(line.quantity, line.minQuantity ?? 0)

/** Dòng đang tính theo tối thiểu (để hiện "dưới tối thiểu"). */
export const isBelowMinimum = (line: OrderLine) =>
  line.quantity !== '' && line.quantity > 0 && line.quantity < (line.minQuantity ?? 0)

/** Phụ phí giặt nhanh / đơn vị của dòng: 0 nếu đơn thường hoặc dịch vụ không hỗ trợ. */
export const lineExpressSurcharge = (orderType: OrderType, service: PricingService | undefined) =>
  orderType === 'EXPRESS' && service?.expressSupported ? (service.expressSurcharge ?? 0) : 0

/**
 * QĐ5: Tổng = Σ(đơn giá × KL tính tiền) + Phụ phí giặt nhanh + Phụ phí đồ trắng − Giảm giá.
 * Làm tròn từng dòng về đồng; giảm giá không vượt tổng tiền hàng. Chỉ để hiển thị: BE tính số chính thức.
 */
export function computeTotals(
  lines: OrderLine[],
  orderType: OrderType,
  services: ReadonlyMap<number, PricingService>,
  voucherDiscount = 0,
  whitesFee = 0,
): Totals {
  const perLine = lines.map((l) => Math.round(l.unitPrice * billable(l)))
  const subtotal = perLine.reduce((a, b) => a + b, 0)
  const expressFee = lines.reduce(
    (sum, l) =>
      sum + Math.round(billable(l) * lineExpressSurcharge(orderType, services.get(l.serviceId))),
    0,
  )
  const discount = Math.min(Math.max(voucherDiscount, 0), subtotal)
  return {
    subtotal,
    discount,
    expressFee,
    whitesFee,
    total: subtotal - discount + expressFee + whitesFee,
    perLine,
  }
}
