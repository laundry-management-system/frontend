import type { Health } from './types'

export const isHealthy = (h: Health) => h.api === 'UP' && h.database === 'UP'
