import { Alert, Button, Card, Center, Grid, Group, Loader, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { LuCircleCheck, LuCloudOff, LuInfo, LuLock, LuPrinter, LuWalletCards } from 'react-icons/lu'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  type ShiftDetail,
  ShiftSlipPrintArea,
  ShiftSlipSheet,
  ShiftTransactionsTable,
  usePrintShiftSlip,
  useShift,
} from '@/features/shifts'
import { toApiError } from '@/shared/api/apiError'
import { ConfirmModal, EmptyState, EntityCode, PageHeader } from '@/shared/ui'
import { CashStep } from './components/CashStep'
import { CloseSummary } from './components/CloseSummary'
import { HandoverStep } from './components/HandoverStep'
import { ReconcileHeader } from './components/ReconcileHeader'
import { ShiftBreadcrumbs, ShiftDescription, ShiftTitle } from './components/ShiftHeading'
import { TransactionsSection } from './components/TransactionsSection'
import { TransferStep } from './components/TransferStep'
import { ShiftReconcileContext, useShiftReconcileContext } from './ShiftReconcileContext'
import { type ShiftPageMode, useShiftReconcile } from './useShiftReconcile'
import { PATHS } from '@/shared/config/paths'

/** Kết ca (`close`, nhập liệu) và xem / duyệt ca (`approve`, chỉ đọc) dùng chung một bố cục. */
export default function ShiftReconcilePage({ mode }: { mode: ShiftPageMode }) {
  const id = Number(useParams().id)
  const [closed, setClosed] = useState<ShiftDetail | null>(null)
  // Kết xong thì thôi đọc lại ca: nhân viên không còn quyền xem ca đã kết
  const { data: shift, isLoading, isError, error, refetch } = useShift(id, closed == null)
  const handleRetry = () => refetch()
  const back =
    mode === 'close' ? (
      <Button variant="secondary" component={Link} to={PATHS.workList}>
        Về danh sách công việc
      </Button>
    ) : (
      <Button variant="secondary" component={Link} to={PATHS.shifts}>
        Về danh sách ca
      </Button>
    )

  if (closed) return <ClosedView shift={closed} />
  if (isLoading) {
    return (
      <Center h="40vh">
        <Loader />
      </Center>
    )
  }
  if (isError || !shift) {
    const status = toApiError(error).status
    if (status === 403 || status === 404) {
      return (
        <EmptyState
          icon={<LuWalletCards size={32} />}
          title={status === 403 ? 'Không xem được ca này' : 'Không tìm thấy ca'}
          description={
            status === 403
              ? 'Chỉ người mở ca (khi ca đang mở) hoặc Admin được xem ca.'
              : 'Ca không tồn tại hoặc đã bị xóa.'
          }
          action={back}
        />
      )
    }
    return (
      <EmptyState
        icon={<LuCloudOff size={32} />}
        title="Không tải được ca"
        description="Vui lòng kiểm tra kết nối rồi thử lại."
        action={
          <Button variant="secondary" onClick={handleRetry}>
            Thử lại
          </Button>
        }
      />
    )
  }
  if (mode === 'close' && shift.status !== 'OPEN') {
    return (
      <EmptyState
        icon={<LuWalletCards size={32} />}
        title={`Ca ${shift.code} đã kết`}
        description="Ca đã kết không sửa được nữa."
        action={back}
      />
    )
  }
  if (mode === 'approve' && shift.status === 'OPEN') return <OpenShiftView shift={shift} />
  return <ShiftWorkspace mode={mode} shift={shift} onClosed={setClosed} />
}

/** Cấp số liệu đối chiếu cho các section qua context, rồi dựng bố cục 3 bước + tóm tắt */
function ShiftWorkspace({
  mode,
  shift,
  onClosed,
}: {
  mode: ShiftPageMode
  shift: ShiftDetail
  onClosed: (s: ShiftDetail) => void
}) {
  const reconcile = useShiftReconcile(mode, shift, onClosed)

  if (reconcile.forbidden) {
    return (
      <EmptyState
        icon={<LuWalletCards size={32} />}
        title="Không kết được ca này"
        description="Chỉ người mở ca hoặc Admin được kết ca."
      />
    )
  }

  return (
    <ShiftReconcileContext.Provider value={reconcile}>
      <ReconcileHeader />
      <Grid gap="lg" align="flex-start">
        <Grid.Col span={{ base: 12, md: 8 }}>
          <Stack gap="lg">
            <CashStep />
            <TransferStep />
            <HandoverStep />
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 4 }}>
          <CloseSummary />
        </Grid.Col>
      </Grid>
      <TransactionsSection />
      <ConfirmCloseModal />
    </ShiftReconcileContext.Provider>
  )
}

function ConfirmCloseModal() {
  const { shift, confirming, closeConfirm, submit, closing } = useShiftReconcileContext()
  return (
    <ConfirmModal
      opened={confirming}
      onClose={closeConfirm}
      onConfirm={submit}
      kind="confirm"
      title={`Kết ca ${shift.code}?`}
      loading={closing}
    >
      Sau khi kết, ca không sửa được. Hủy xác nhận hoặc hoàn tiền phát sinh sau sẽ ghi vào ca đang
      mở.
    </ConfirmModal>
  )
}

/** Xem ca còn đang mở: chưa có số liệu kết ca, chỉ có giao dịch và nút Kết ca thay */
function OpenShiftView({ shift }: { shift: ShiftDetail }) {
  const navigate = useNavigate()
  const goCloseOnBehalf = () => navigate(PATHS.shiftClose(shift.id))
  const actions = (
    <Button color="danger" leftSection={<LuLock size={16} />} onClick={goCloseOnBehalf}>
      Kết ca thay
    </Button>
  )
  return (
    <>
      <ShiftBreadcrumbs code={shift.code} />
      <PageHeader
        title={<ShiftTitle shift={shift} />}
        description={<ShiftDescription shift={shift} />}
        actions={actions}
      />
      <Alert color="info" variant="light" icon={<LuInfo size={18} />} mb="lg">
        Ca đang mở, chưa có số liệu kết ca. Nhân viên quên kết ca thì bấm “Kết ca thay” (bắt buộc
        ghi lý do).
      </Alert>
      <Card>
        <Stack gap="sm">
          <Text fw={700} size="lg">
            Giao dịch trong ca
          </Text>
          <ShiftTransactionsTable shiftId={shift.id} />
        </Stack>
      </Card>
    </>
  )
}

/** Sau khi kết ca: phiếu kết ca và nút in (tự in một lần) */
function ClosedView({ shift }: { shift: ShiftDetail }) {
  const navigate = useNavigate()
  const { slip, print } = usePrintShiftSlip(shift)
  const reprint = () => print(shift)
  const goWorkList = () => navigate(PATHS.workList)
  const actions = (
    <Group gap="sm">
      <Button variant="secondary" onClick={goWorkList}>
        Về danh sách công việc
      </Button>
      <Button leftSection={<LuPrinter size={16} />} onClick={reprint}>
        In phiếu kết ca
      </Button>
    </Group>
  )

  return (
    <>
      <PageHeader
        title="Đã kết ca"
        description={<EntityCode code={shift.code} />}
        actions={actions}
      />
      <Alert color="success" variant="light" icon={<LuCircleCheck size={18} />} mb="lg">
        Ký phiếu và kẹp cùng tiền nộp chủ tiệm. Ca đã kết không sửa được.
      </Alert>
      <Card maw={360} p={0}>
        <ShiftSlipSheet shift={shift} />
      </Card>
      <ShiftSlipPrintArea shift={slip} />
    </>
  )
}
