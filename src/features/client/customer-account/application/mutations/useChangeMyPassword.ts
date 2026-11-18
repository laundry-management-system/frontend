import { useMutation } from '@tanstack/react-query'
import { notify } from '@/shared/common/lib/notify'
import { customerPortalApi } from '../../data/customerPortalApi'
import type { ChangePasswordValues } from '../schemas'
import { useCustomerSessionStore } from '../sessionStore'

export function useChangeMyPassword() {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }: ChangePasswordValues) =>
      customerPortalApi.changePassword({ currentPassword, newPassword }),
    onSuccess: (token) => {
      useCustomerSessionStore.getState().setSession(token)
      notify.success('Đã đổi mật khẩu')
    },
  })
}
