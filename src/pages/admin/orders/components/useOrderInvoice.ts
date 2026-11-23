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
    t: PaymentTxn,
    name: string,
    extra: Pick<Invoice, 'cash' | 'receiver'>,
  ) =>
    buildInvoice(o, t, {
      shopName: shop.data?.shopName ?? '',
      hotline: shop.data?.hotline ?? '',
      confirmedByName: name,
      ...extra,
    })
  const printInvoice = () =>
    order &&
    txn &&
    invoicePrint.print(
      makeInvoice(order, txn, confirmerName, {
        cash: null,
        receiver: order.deliveredAt
          ? { name: order.receiverName, relation: order.receiverRelation }
          : null,
      }),
    )
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
