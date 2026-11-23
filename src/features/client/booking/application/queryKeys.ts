export const bookingKeys = {
  all: ['booking'] as const,
  settings: () => [...bookingKeys.all, 'settings'] as const,
}
