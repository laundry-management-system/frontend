import {
  Anchor,
  Box,
  Breadcrumbs,
  Button,
  Center,
  Group,
  Input,
  Loader,
  TextInput,
} from '@mantine/core'
import { type ChangeEvent, type KeyboardEvent, useState } from 'react'
import { LuCheck, LuCloudOff, LuFileX, LuPencil, LuSearch } from 'react-icons/lu'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { selectHasRole, useAuthStore } from '@/features/admin/auth'
import {
  type IncidentDetail,
  IncidentEditor,
  type IncidentOrderView,
  toOrderView,
  useIncident,
} from '@/features/admin/incidents'
import { useOrder, useOrders } from '@/features/admin/orders'
import { toApiError } from '@/shared/common/api/apiError'
import { formatDateTime, formatMoney } from '@/shared/common/lib/format'
import { CopyableCode, EmptyState, EntityCode, PageHeader, StatusBadge } from '@/shared/admin/ui'
import { PATHS } from '@/shared/common/config/paths'

const dateTime = (iso: string) => formatDateTime(iso).slice(0, 16)

/** Ô tra mã đơn khi lập phiếu từ danh sách (chưa biết đơn). */
function OrderLookupField({ onFound }: { onFound: (orderId: number) => void }) {
  const [code, setCode] = useState('')
  const [submitted, setSubmitted] = useState('')
  const [error, setError] = useState<string | null>(null)
  const { data, isFetching } = useOrders({ q: submitted, page: 0 })

  const match = submitted
    ? data?.content.find((o) => o.orderCode.toLowerCase() === submitted.toLowerCase())
    : undefined
  // Kết quả tra về thì báo lỗi hoặc chọn đơn ngay trong render, không cần effect
  const [handled, setHandled] = useState('')
  if (submitted && data && !isFetching && handled !== submitted) {
    setHandled(submitted)
    if (!match) setError('Không tìm thấy đơn')
    else if (match.status === 'CANCELLED') setError('Không lập phiếu cho đơn đã hủy')
    else onFound(match.id)
  }

  const lookup = () => {
    setError(null)
    setHandled('')
    setSubmitted(code.trim())
  }
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => setCode(e.currentTarget.value)
  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    lookup()
  }

  return (
    <TextInput
      label="Đơn liên quan"
      placeholder="Nhập mã đơn, VD LD-20260916-005"
      required
      value={code}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      onBlur={lookup}
      error={error}
      rightSection={isFetching ? <Loader size="xs" /> : <LuSearch size={16} />}
    />
  )
}

function OrderCodeField({ code }: { code: string }) {
  return (
    <Input.Wrapper label="Đơn liên quan">
      <Box pt={4}>
        <CopyableCode code={code} />
      </Box>
    </Input.Wrapper>
  )
}

export default function IncidentDetailPage() {
  const navigate = useNavigate()
  const { id } = useParams()
  const [searchParams] = useSearchParams()
  const isCreate = !id
  const incidentId = isCreate ? null : Number(id)
  const isAdmin = useAuthStore(selectHasRole('ADMIN'))

  const incidentQuery = useIncident(incidentId)
  const incident = incidentQuery.data ?? null
  const queryOrderId = Number(searchParams.get('orderId')) || null
  const [lookedUpOrderId, setLookedUpOrderId] = useState<number | null>(null)
  const [editing, setEditing] = useState(false)
  const orderId = incident?.orderId ?? queryOrderId ?? lookedUpOrderId
  // Phiếu đã xử lý dùng bản chụp trên phiếu, không cần tải đơn
  const needOrder = isCreate || incident?.status === 'pending'
  const orderQuery = useOrder(needOrder ? orderId : null)
  const view: IncidentOrderView | null = orderQuery.data ? toOrderView(orderQuery.data) : null

  const handleRetry = () => {
    incidentQuery.refetch()
    orderQuery.refetch()
  }
  const handleSaved = (saved: IncidentDetail) => {
    if (isCreate) navigate(PATHS.incidentDetail(saved.id), { replace: true })
    else setEditing(false)
  }
  const [reviewing, setReviewing] = useState(false)
  const startEdit = () => setEditing(true)
  const openReview = () => setReviewing(true)
  const closeReview = () => setReviewing(false)
  const cancelEdit = () => setEditing(false)
  const handleConflict = () => incidentQuery.refetch()

  const loading =
    (!isCreate && incidentQuery.isLoading) || (needOrder && !!orderId && orderQuery.isLoading)
  if (loading)
    return (
      <Center h="60vh">
        <Loader />
      </Center>
    )

  const failed = (!isCreate && !incident) || (isCreate && !!orderId && !orderQuery.data)
  if (failed) {
    const error = incidentQuery.error ?? orderQuery.error
    const loadFailed = !!error && toApiError(error).status !== 404
    const backAction = loadFailed ? (
      <Button variant="secondary" onClick={handleRetry}>
        Thử lại
      </Button>
    ) : (
      <Button variant="secondary" component={Link} to={PATHS.incidents}>
        Về danh sách sự cố
      </Button>
    )
    return (
      <EmptyState
        icon={loadFailed ? <LuCloudOff size={32} /> : <LuFileX size={32} />}
        title={
          loadFailed
            ? 'Không tải được phiếu'
            : isCreate
              ? 'Không tìm thấy đơn'
              : 'Không tìm thấy phiếu sự cố'
        }
        description={
          loadFailed
            ? 'Vui lòng kiểm tra kết nối rồi thử lại.'
            : 'Phiếu hoặc đơn này không tồn tại, hoặc đường dẫn không đúng.'
        }
        action={backAction}
      />
    )
  }

  if (isCreate && orderQuery.data?.status === 'CANCELLED')
    return (
      <EmptyState
        icon={<LuFileX size={32} />}
        title="Không lập phiếu cho đơn đã hủy"
        description="Đơn đã hủy không lập được phiếu sự cố."
        action={
          <Button variant="secondary" component={Link} to={PATHS.orderDetail(orderQuery.data.id)}>
            Về đơn hàng
          </Button>
        }
      />
    )

  const orderCode = incident?.orderCode ?? view?.orderCode
  const orderField =
    orderCode != null ? (
      <OrderCodeField code={orderCode} />
    ) : (
      <OrderLookupField onFound={setLookedUpOrderId} />
    )

  const headerDescription = incident ? (
    <>
      Lập {dateTime(incident.createdAt)} bởi {incident.createdBy} · đơn{' '}
      <Anchor component={Link} to={PATHS.orderDetail(incident.orderId)}>
        <EntityCode code={incident.orderCode} size="sm" />
      </Anchor>
      {` · ${incident.order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'} · tiền hàng ${formatMoney(incident.order.subtotal)}`}
    </>
  ) : view ? (
    <>
      Đơn <EntityCode code={view.orderCode} size="sm" />
      {` · ${view.order.paymentStatus === 'PAID' ? 'Đã thanh toán' : 'Chưa thanh toán'} · tiền hàng ${formatMoney(view.order.subtotal)}`}
    </>
  ) : (
    'Nhập mã đơn để bắt đầu'
  )
  const title = incident ? (
    <Group gap="sm" align="center">
      Phiếu sự cố <EntityCode code={incident.code} size="display" />
      <StatusBadge group="incident" statusKey={incident.status} />
    </Group>
  ) : (
    'Lập phiếu sự cố'
  )
  const canAct = incident?.status === 'pending' && !editing
  const headerActions = canAct && (
    <Group gap="sm">
      {isAdmin && (
        <Button leftSection={<LuCheck size={16} />} onClick={openReview}>
          Duyệt
        </Button>
      )}
      <Button variant="secondary" leftSection={<LuPencil size={16} />} onClick={startEdit}>
        Sửa
      </Button>
    </Group>
  )

  return (
    <>
      <Breadcrumbs mb="xs">
        <Anchor component={Link} to={PATHS.incidents} size="sm">
          Sự cố & bồi thường
        </Anchor>
        {incident ? <EntityCode code={incident.code} size="sm" /> : <span>Lập phiếu</span>}
      </Breadcrumbs>
      <PageHeader title={title} description={headerDescription} actions={headerActions} />
      <IncidentEditor
        key={`${incident?.id ?? 'new'}-${incident?.status ?? ''}-${view?.orderId ?? 'none'}`}
        incident={incident}
        view={view}
        orderField={orderField}
        isAdmin={isAdmin}
        editing={isCreate || editing}
        onCancelEdit={cancelEdit}
        reviewing={reviewing}
        onReviewClose={closeReview}
        onSaved={handleSaved}
        onConflict={handleConflict}
      />
    </>
  )
}
