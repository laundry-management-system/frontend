import { useMutation } from '@tanstack/react-query'
import { customerLogout } from '../session'

export function useCustomerLogout() {
  return useMutation({ mutationFn: customerLogout })
}
