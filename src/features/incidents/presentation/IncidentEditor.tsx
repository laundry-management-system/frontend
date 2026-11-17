import { Button, Grid, Group, Stack } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { type ReactNode, useEffect } from 'react'
import { useBlocker } from 'react-router-dom'
import { toApiError } from '@/shared/api/apiError'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal } from '@/shared/ui'
import { useSaveIncident } from '../application/mutations/useSaveIncident'
import { incidentFormSchema } from '../application/schemas'
import { compensationOf } from '../domain/rules'
import { INCIDENT_UNIT_LABEL } from '../domain/types'
import type {
  CompensationContext,
  IncidentDetail,
  IncidentFormValues,
  IncidentImage,
} from '../domain/types'
import { ConditionCompareCard } from './form/ConditionCompareCard'
import { IncidentInfoCard } from './form/IncidentInfoCard'
import type { IncidentOrderView } from './form/orderView'
import { ResolutionCard } from './form/ResolutionCard'
import { PayoutCard } from './review/PayoutCard'
import { ReviewModal } from './review/ReviewModal'
import { ReviewResultCard } from './review/ReviewResultCard'

const EMPTY_CTX: CompensationContext = {
  items: [],
  compensationMultiplier: 10,
  compensationCap: 500000,
}
// Tên field BE khác tên ô trên form
const FIELD_OF: Record<string, keyof IncidentFormValues> = { imageIds: 'images' }

const valuesOf = (incident: IncidentDetail | null): IncidentFormValues => ({
  orderItemId: incident?.orderItemId != null ? String(incident.orderItemId) : null,
  affectedCount: incident?.affectedCount ?? 1,
  type: incident?.type ?? null,
  description: incident?.description ?? '',
  resolution: incident?.resolution ?? null,
  amount: incident?.amount ?? 0,
  images: incident?.images ?? [],
})

/**
 * Lập / sửa / duyệt một phiếu. `view` là đơn của phiếu (null khi chưa tra được đơn);
 * đổi đơn thì remount (key) để luật kiểm tra dùng đúng dòng đồ và điều khoản của đơn.
 */
export function IncidentEditor({
  incident,
  view,
  orderField,
  isAdmin,
  editing,
  onCancelEdit,
  reviewing,
  onReviewClose,
  onSaved,
  onConflict,
}: {
  incident: IncidentDetail | null
  view: IncidentOrderView | null
  orderField: ReactNode
  isAdmin: boolean
  /** Phiếu mở ra ở chế độ xem; bấm Sửa ở đầu trang mới vào chế độ sửa (phiếu mới luôn sửa) */
  editing: boolean
  onCancelEdit: () => void
  /** Admin bấm Duyệt ở đầu trang */
  reviewing: boolean
  onReviewClose: () => void
  onSaved: (incident: IncidentDetail) => void
  onConflict: () => void
}) {
  const save = useSaveIncident()
  const pending = !incident || incident.status === 'pending'
  const readOnly = !editing
  const form = useForm<IncidentFormValues>({
    initialValues: valuesOf(incident),
    validate: schemaResolver(incidentFormSchema(view?.ctx ?? EMPTY_CTX), { sync: true }),
  })

  const dirty = editing && form.isDirty()
  const blocker = useBlocker(
    ({ currentLocation, nextLocation }) =>
      dirty && !save.isPending && currentLocation.pathname !== nextLocation.pathname,
  )
  useEffect(() => {
    if (!dirty) return
    const warn = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', warn)
    return () => window.removeEventListener('beforeunload', warn)
  }, [dirty])
  const cancelLeave = () => blocker.reset?.()
  const confirmLeave = () => blocker.proceed?.()

  const live = view
    ? compensationOf(view.ctx, form.values.orderItemId, form.values.affectedCount)
    : null
  const snapshot =
    readOnly && incident?.itemUnit && incident.unitPrice != null
      ? {
          unit: incident.itemUnit,
          unitPrice: incident.unitPrice,
          affected: incident.affectedCount,
          max: incident.maxCompensation,
          lineTotal: incident.lineTotal,
        }
      : null
  const comp =
    snapshot ??
    (live && {
      unit: live.item.unit,
      unitPrice: live.item.unitPrice,
      affected: live.affected,
      max: live.max,
      lineTotal: live.item.lineTotal,
    })
  const multiplier = incident?.compensationMultiplier ?? view?.ctx.compensationMultiplier ?? 10
  const cap = incident?.compensationCap ?? view?.ctx.compensationCap ?? 500000
  const initial =
    readOnly && incident
      ? { images: incident.initialImages, note: incident.initialNote }
      : (view?.initialOf(form.values.orderItemId) ?? { images: [], note: null })

  const cancelEdit = () => {
    form.reset()
    onCancelEdit()
  }
  // Đóng modal duyệt mà không duyệt thì bỏ phương án / số tiền vừa chỉnh
  const closeReview = () => {
    form.reset()
    onReviewClose()
  }
  const setImages = (images: IncidentImage[]) => form.setFieldValue('images', images)

  const handleSave = form.onSubmit((v) => {
    if (!view) return notify.error('Nhập mã đơn liên quan')
    save.mutate(
      {
        id: incident?.id,
        dto: {
          orderId: incident ? undefined : view.orderId,
          orderItemId: v.orderItemId ? Number(v.orderItemId) : null,
          affectedCount: v.orderItemId && typeof v.affectedCount === 'number' ? v.affectedCount : 1,
          type: v.type!,
          description: v.description.trim(),
          resolution: v.resolution!,
          amount: v.resolution === 'REWASH' || v.amount === '' ? 0 : v.amount,
          imageIds: v.images.map((i) => i.id),
        },
      },
      {
        onSuccess: (saved) => {
          form.resetDirty()
          notify.success(incident ? 'Đã lưu phiếu sự cố' : `Đã lập phiếu ${saved.code}`)
          onSaved(saved)
        },
        onError: (e) => {
          const err = toApiError(e)
          if (err.status === 409) onConflict()
          const fieldErrors = Object.fromEntries(
            Object.entries(err.fieldErrors ?? {}).map(([k, msg]) => [FIELD_OF[k] ?? k, msg]),
          )
          form.setErrors(fieldErrors)
          notify.error(err.message)
        },
      },
    )
  })

  const customer = incident
    ? { name: incident.customerName, phone: incident.customerPhone }
    : view && { name: view.customerName, phone: view.customerPhone }
  const itemText =
    incident?.itemLabel && incident.itemUnit
      ? `${incident.itemLabel} · ${incident.affectedCount} ${INCIDENT_UNIT_LABEL[incident.itemUnit]} bị sự cố`
      : undefined

  const leftColumn = (
    <Stack gap="lg">
      <IncidentInfoCard
        form={form}
        view={view}
        orderField={orderField}
        customer={customer}
        itemText={itemText}
        readOnly={readOnly}
      />
      <ConditionCompareCard
        initialImages={initial.images}
        initialNote={initial.note}
        images={form.values.images}
        onImagesChange={setImages}
        readOnly={readOnly}
        error={form.errors.images as string | undefined}
      />
    </Stack>
  )

  const saveActions = (
    <Group grow>
      {incident && (
        <Button variant="default" onClick={cancelEdit} disabled={save.isPending}>
          Hủy
        </Button>
      )}
      <Button type="submit" loading={save.isPending}>
        {incident ? 'Lưu thay đổi' : 'Lưu phiếu'}
      </Button>
    </Group>
  )

  const pendingColumn = (
    <Stack gap="lg">
      <ResolutionCard
        form={form}
        limit={comp}
        multiplier={multiplier}
        cap={cap}
        readOnly={readOnly}
      >
        {editing && saveActions}
      </ResolutionCard>
    </Stack>
  )

  const reviewedColumn = incident && (
    <Stack gap="lg">
      <ReviewResultCard incident={incident} />
      {incident.status === 'approved' && incident.amount > 0 && (
        <PayoutCard incident={incident} isAdmin={isAdmin} />
      )}
    </Stack>
  )

  return (
    <form onSubmit={handleSave} noValidate>
      <Grid gap="lg" align="flex-start">
        <Grid.Col span={{ base: 12, lg: 8 }}>{leftColumn}</Grid.Col>
        <Grid.Col span={{ base: 12, lg: 4 }}>{pending ? pendingColumn : reviewedColumn}</Grid.Col>
      </Grid>
      {pending && !editing && isAdmin && incident && view && (
        <ReviewModal
          incidentId={incident.id}
          incidentCode={incident.code}
          opened={reviewing}
          onClose={closeReview}
          form={form}
          order={view.order}
          max={comp?.max ?? 0}
          lineTotal={comp?.lineTotal ?? null}
          onConflict={onConflict}
        />
      )}
      <ConfirmModal
        opened={blocker.state === 'blocked'}
        onClose={cancelLeave}
        onConfirm={confirmLeave}
        kind="destructive"
        title="Bỏ thay đổi?"
        confirmLabel="Bỏ thay đổi"
      >
        Phiếu sự cố có thay đổi chưa lưu.
      </ConfirmModal>
    </form>
  )
}
