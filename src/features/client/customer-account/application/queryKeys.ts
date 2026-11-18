export const customerKeys = {
  all: ['customer-account'] as const,
  me: () => [...customerKeys.all, 'me'] as const,
  orders: (page: number) => [...customerKeys.all, 'orders', page] as const,
}
