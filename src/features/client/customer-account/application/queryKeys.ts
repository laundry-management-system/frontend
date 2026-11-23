export const customerKeys = {
  all: ['customer-account'] as const,
  me: () => [...customerKeys.all, 'me'] as const,
  paymentQr: (orderCode: string) => [...customerKeys.all, 'payment-qr', orderCode] as const,
  order: (orderCode: string) => [...customerKeys.all, 'order', orderCode] as const,
  orders: (page: number) => [...customerKeys.all, 'orders', page] as const,
}
