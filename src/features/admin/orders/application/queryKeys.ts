export const orderKeys = {
  all: ['orders'] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
  list: (params: object) => [...orderKeys.all, 'list', params] as const,
  counts: () => [...orderKeys.all, 'counts'] as const,
  work: (params: object) => [...orderKeys.all, 'work', params] as const,
  workCounts: (params: object) => [...orderKeys.all, 'work-counts', params] as const,
  overdue: () => [...orderKeys.all, 'overdue'] as const,
  payments: (orderCode: string) => [...orderKeys.all, 'payments', orderCode] as const,
  vietQr: (orderCode: string) => [...orderKeys.all, 'vietqr', orderCode] as const,
}
