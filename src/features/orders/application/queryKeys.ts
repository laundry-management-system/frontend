export const orderKeys = {
  all: ['orders'] as const,
  detail: (id: number) => [...orderKeys.all, 'detail', id] as const,
  list: (params: object) => [...orderKeys.all, 'list', params] as const,
  counts: () => [...orderKeys.all, 'counts'] as const,
}
