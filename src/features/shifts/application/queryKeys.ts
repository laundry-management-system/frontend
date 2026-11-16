export const shiftKeys = {
  all: ['shifts'] as const,
  current: () => [...shiftKeys.all, 'current'] as const,
  list: (params: object) => [...shiftKeys.all, 'list', params] as const,
  summary: (range: object) => [...shiftKeys.all, 'summary', range] as const,
  detail: (id: number) => [...shiftKeys.all, 'detail', id] as const,
  transactions: (id: number, params: object) =>
    [...shiftKeys.all, 'transactions', id, params] as const,
}
