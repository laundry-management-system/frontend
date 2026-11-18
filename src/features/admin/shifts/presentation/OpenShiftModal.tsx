import { Anchor, Button, Group, Modal, Stack, Text, Textarea } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import dayjs from 'dayjs'
import { type FormEvent, useRef, useState } from 'react'
import { LuPencil, LuTriangleAlert } from 'react-icons/lu'
import { toApiError } from '@/shared/common/api/apiError'
import { formatMoney } from '@/shared/common/lib/format'
import { notify } from '@/shared/common/lib/notify'
import { EntityCode, InfoLabel, ModalFooter, MoneyInput } from '@/shared/admin/ui'
import { type OpenShiftFormValues, openShiftSchema } from '../application/schemas'
import { useCurrentShift } from '../application/queries/useCurrentShift'
import { useOpenShift } from '../application/mutations/useOpenShift'
import type { PreviousShift } from '../domain/types'

const LEFT_ALIGNED_INPUT = { input: { textAlign: 'left' as const } }

const AMOUNT_CARD = {
  border: '1px solid var(--ds-border)',
  borderRadius: 'var(--radius-control)',
  background: 'var(--ds-muted)',
} as const

const CASH_INFO =
  'Đếm tiền lẻ đang có trong két. Mặc định bằng tiền để lại két của ca trước; đếm ra khác thì bấm Sửa. Thao tác được ghi nhật ký.'

const REASON_INFO =
  'Bắt buộc vì tiền đầu ca khác tiền để lại két của ca trước. Lý do được ghi nhật ký.'

const formatSigned = (v: number) => `${v > 0 ? '+' : '−'}${formatMoney(Math.abs(v))}`

interface OpenShiftModalProps {
  opened: boolean
  onClose: () => void
  /** Họ tên người đang đăng nhập: người mở ca là người phụ trách két */
  staffName: string
  onOpened?: () => void
}

export function OpenShiftModal(props: OpenShiftModalProps) {
  const { opened, onClose, staffName } = props
  const title = (
    <Stack gap={2}>
      <Text fw={700} size="lg">
        Mở ca
      </Text>
      <Text size="sm" c="dimmed">
        Người giữ két ca này:{' '}
        <Text span fw={600} c="var(--ds-foreground)">
          {staffName}
        </Text>
      </Text>
    </Stack>
  )
  return (
    <Modal opened={opened} onClose={onClose} centered size={480} title={title}>
      {opened && <OpenShiftForm {...props} />}
    </Modal>
  )
}

function OpenShiftForm({ onClose, onOpened }: OpenShiftModalProps) {
  const { data } = useCurrentShift()
  const previous = data?.previous ?? null
  const suggested = previous?.keepCash ?? null
  const open = useOpenShift()

  const form = useForm<OpenShiftFormValues>({
    initialValues: { openingCash: suggested ?? '', openingReason: '' },
    validate: schemaResolver(openShiftSchema(suggested), { sync: true }),
  })
  // Có số gợi ý thì hiện sẵn số đó, bấm Sửa mới nhập được
  const [editing, setEditing] = useState(suggested == null)
  const cashRef = useRef<HTMLInputElement>(null)
  const cash = form.values.openingCash
  const difference = suggested != null && cash !== '' ? cash - suggested : 0

  const startEdit = () => {
    setEditing(true)
    // Ô nhập chỉ xuất hiện sau lần render tới; chọn sẵn số cũ để gõ đè
    requestAnimationFrame(() => cashRef.current?.select())
  }
  const useSuggestion = () => {
    form.setValues({ openingCash: suggested ?? '', openingReason: '' })
    form.clearErrors()
    setEditing(false)
  }

  const handleSubmit = (values: OpenShiftFormValues) => {
    const reason = difference !== 0 ? values.openingReason.trim() : ''
    open.mutate(
      { openingCash: Number(values.openingCash), ...(reason && { openingReason: reason }) },
      {
        onSuccess: (shift) => {
          notify.success(`Đã mở ca ${shift.code}`)
          onClose()
          onOpened?.()
        },
        onError: (err) => {
          const error = toApiError(err)
          if (Object.keys(error.fieldErrors).some((key) => key in form.values)) {
            form.setErrors(error.fieldErrors)
          } else {
            notify.error(error.message)
          }
        },
      },
    )
  }

  // Modal nằm trong form khác (VD modal thanh toán): sự kiện submit của React lan qua portal lên form cha
  const submitForm = (e: FormEvent<HTMLFormElement>) => {
    e.stopPropagation()
    form.onSubmit(handleSubmit)(e)
  }

  const cashLabel = <InfoLabel info={CASH_INFO}>Tiền đầu ca (thực đếm)</InfoLabel>

  const suggestedAmount = previous && (
    <Stack gap={4} p="md" style={AMOUNT_CARD}>
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          {cashLabel}
        </Text>
        <Button
          variant="subtle"
          size="compact-sm"
          leftSection={<LuPencil size={14} />}
          onClick={startEdit}
        >
          Sửa
        </Button>
      </Group>
      <div className="text-numeric-display">{formatMoney(previous.keepCash)}</div>
      <SuggestionSource previous={previous} />
    </Stack>
  )

  const cashInput = (
    <Stack gap={6}>
      <MoneyInput
        ref={cashRef}
        label={cashLabel}
        required
        data-autofocus
        styles={LEFT_ALIGNED_INPUT}
        {...form.getInputProps('openingCash')}
      />
      {previous && (
        <Anchor component="button" type="button" size="sm" ta="left" onClick={useSuggestion}>
          Dùng lại số gợi ý ({formatMoney(previous.keepCash)})
        </Anchor>
      )}
    </Stack>
  )

  const differenceNote = difference !== 0 && (
    <Group gap={6} wrap="nowrap" className="text-tone-warning-fg">
      <LuTriangleAlert size={16} aria-hidden />
      <Text size="sm" fw={600} c="inherit">
        Lệch {formatSigned(difference)} so với tiền để lại két ca trước
      </Text>
    </Group>
  )

  const reasonField = difference !== 0 && (
    <Textarea
      label={<InfoLabel info={REASON_INFO}>Lý do</InfoLabel>}
      placeholder="VD: ca trước rút 20.000đ mua xà phòng"
      required
      autosize
      minRows={2}
      maxLength={255}
      {...form.getInputProps('openingReason')}
    />
  )

  return (
    <form onSubmit={submitForm} noValidate>
      <Stack gap="md">
        {editing ? cashInput : suggestedAmount}
        {differenceNote}
        {reasonField}
      </Stack>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Để sau
        </Button>
        <Button type="submit" loading={open.isPending} data-autofocus={editing ? undefined : true}>
          Mở ca
        </Button>
      </ModalFooter>
    </form>
  )
}

function SuggestionSource({ previous }: { previous: PreviousShift }) {
  return (
    <Text size="xs" c="dimmed">
      Bằng tiền để lại két của ca <EntityCode code={previous.code} size="sm" /> ·{' '}
      {previous.closedByName} · kết {dayjs(previous.closedAt).format('DD/MM HH:mm')}
    </Text>
  )
}
