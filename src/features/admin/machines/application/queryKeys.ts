export const machineKeys = {
  all: ['machines'] as const,
  list: () => [...machineKeys.all, 'list'] as const,
}
