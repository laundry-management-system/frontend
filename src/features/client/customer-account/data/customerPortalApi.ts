import { type SpringPage, fromSpringPage } from '@/shared/common/api/page'
import { customerHttpClient } from '@/shared/common/api/httpClient'
import type {
  AuthenticationResponseDto,
  ChangeMyPasswordRequestDto,
  CustomerOrderDetailDto,
  CustomerOrderDto,
  CustomerProfileDto,
  PaymentQrDto,
  UpdateMyProfileRequestDto,
} from './dto'

export const customerPortalApi = {
  getMe: async () => (await customerHttpClient.get<CustomerProfileDto>('/customer-portal/me')).data,
  updateMe: async (dto: UpdateMyProfileRequestDto) =>
    (await customerHttpClient.put<CustomerProfileDto>('/customer-portal/me', dto)).data,
  // Đổi mật khẩu cấp cookie refresh mới nên cần withCredentials
  changePassword: async (dto: ChangeMyPasswordRequestDto) =>
    (
      await customerHttpClient.put<AuthenticationResponseDto>('/customer-portal/me/password', dto, {
        withCredentials: true,
      })
    ).data.accessToken,
  getPaymentQr: async (orderCode: string) =>
    (
      await customerHttpClient.get<PaymentQrDto>(
        `/customer-portal/orders/${encodeURIComponent(orderCode)}/payment-qr`,
      )
    ).data,
  getMyOrder: async (orderCode: string) =>
    (
      await customerHttpClient.get<CustomerOrderDetailDto>(
        `/customer-portal/orders/${encodeURIComponent(orderCode)}`,
      )
    ).data,
  applyMyOrderVoucher: async (orderCode: string, voucherCode: string) =>
    (
      await customerHttpClient.put<CustomerOrderDetailDto>(
        `/customer-portal/orders/${encodeURIComponent(orderCode)}/voucher`,
        { voucherCode },
      )
    ).data,
  removeMyOrderVoucher: async (orderCode: string) =>
    (
      await customerHttpClient.delete<CustomerOrderDetailDto>(
        `/customer-portal/orders/${encodeURIComponent(orderCode)}/voucher`,
      )
    ).data,
  claimMyOrderPayment: async (orderCode: string) =>
    (
      await customerHttpClient.post<CustomerOrderDetailDto>(
        `/customer-portal/orders/${encodeURIComponent(orderCode)}/payment-claim`,
      )
    ).data,
  confirmReceived: async (orderCode: string) =>
    (
      await customerHttpClient.post<CustomerOrderDetailDto>(
        `/customer-portal/orders/${encodeURIComponent(orderCode)}/confirm-received`,
      )
    ).data,
  listOrders: async ({ page, size }: { page: number; size: number }) =>
    fromSpringPage(
      (
        await customerHttpClient.get<SpringPage<CustomerOrderDto>>('/customer-portal/orders', {
          params: { page, size },
        })
      ).data,
      (o) => ({ ...o }),
    ),
}
