import { notify } from '@/shared/common/lib/notify'
import { useMe, useUserName } from '@/features/admin/users'
import {
  buildInvoice,
  type CheckoutDone,
  confirmedTxn,
  type Invoice,
  type OrderDetail,
  type PaymentTxn,
  usePayments,
  usePrintInvoice,
  useShopInfo,
} from '@/features/admin/orders'

/** Dữ liệu và thao tác in hóa đơn của trang chi tiết đơn; gọi một lần ở trang, truyền xuống. */
export function useOrderInvoice(order: OrderDetail | undefined) {
  const payments = usePayments(order?.orderCode)
  const txn = confirmedTxn(payments.data ?? [])
  const shop = useShopInfo(order?.id ?? null)
  const confirmerName = useUserName(txn?.confirmedBy ?? null)
  const me = useMe()
  const invoicePrint = usePrintInvoice()

  const makeInvoice = (
    o: OrderDetail,
    t: PaymentTxn | null,
    name: string,
    extra: Pick<Invoice, 'cash' | 'receiver'>,
    info = shop.data,
  ) =>
    buildInvoice(o, t, {
      shopName: info?.shopName ?? '',
      hotline: info?.hotline ?? '',
      confirmedByName: name,
      ...extra,
    })
  // Chưa có giao dịch xác nhận (VD thu khi giao) thì in hóa đơn chưa thanh toán
  const printInvoice = async () => {
    if (!order) return
    const info = shop.data ?? (await shop.refetch()).data
    if (!info) return notify.error('Chưa lấy được thông tin tiệm để in hóa đơn')
    invoicePrint.print(
      makeInvoice(
        order,
        txn,
        confirmerName,
        {
          cash: null,
          receiver: order.deliveredAt
            ? { name: order.receiverName, relation: order.receiverRelation }
            : null,
        },
        info,
      ),
    )
  }
  const handleCheckoutDone = ({ payment, delivery, cash }: CheckoutDone) => {
    const t = payment ?? txn
    if (!order || !t) return
    // Giao dịch vừa tạo do chính người đang đăng nhập xác nhận
    const name = payment ? (me.data?.fullName ?? '') : confirmerName
    const receiver = delivery
      ? { name: delivery.receiverName, relation: delivery.receiverRelation }
      : null
    invoicePrint.print(makeInvoice(order, t, name, { cash, receiver }))
  }

  return {
    invoice: invoicePrint.invoice,
    canPrintInvoice: !!txn && !!shop.data,
    printInvoice,
    handleCheckoutDone,
  }
}
