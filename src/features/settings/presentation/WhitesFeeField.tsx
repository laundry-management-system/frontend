import { Button, Card, Group, Stack, Text } from '@mantine/core'
import { useState } from 'react'
import { LuPencil } from 'react-icons/lu'
import { schemaResolver, useForm } from '@mantine/form'
import { toApiError } from '@/shared/api/apiError'
import { formatMoney } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { IconButton, MoneyInput } from '@/shared/ui'
import { whitesFeeFormSchema, type WhitesFeeFormValues } from '../application/schemas'
import { useShopSettings } from '../application/useShopSettings'
import { useUpdateShopSettings } from '../application/useUpdateShopSettings'

const TITLE = 'Phụ phí giặt riêng đồ trắng'
const INFO =
  'Cộng vào mỗi đơn có tick giặt riêng đồ trắng. Chốt lúc phân loại, đơn đã phân loại giữ phí cũ.'

interface WhitesFeeFieldProps {
  canManage: boolean
}

/** Phụ phí giặt riêng đồ trắng (đ/đơn): Admin sửa, Nhân viên chỉ xem. */
export function WhitesFeeField({ canManage }: WhitesFeeFieldProps) {
  const { data } = useShopSettings()
  const [editing, setEditing] = useState(false)
  const startEdit = () => setEditing(true)
  const stopEdit = () => setEditing(false)

  return (
    <Card mt="lg" px="lg" py="md">
      <Group justify="space-between" align="center" gap="md">
        <Stack gap={2} style={{ flex: 1, minWidth: 240 }}>
          <Text fw={600}>{TITLE}</Text>
          <Text size="sm" c="dimmed">
            {INFO}
          </Text>
        </Stack>
        {data &&
          (editing ? (
            <WhitesFeeForm initial={data.whitesFee} onDone={stopEdit} />
          ) : (
            <Group gap="xs" wrap="nowrap">
              <Text fw={600} size="lg">
                {formatMoney(data.whitesFee)}
                <Text span c="dimmed" size="sm">
                  {' '}
                  / đơn
                </Text>
              </Text>
              {canManage && (
                <IconButton label="Sửa phụ phí" icon={<LuPencil size={16} />} onClick={startEdit} />
              )}
            </Group>
          ))}
      </Group>
    </Card>
  )
}

function WhitesFeeForm({ initial, onDone }: { initial: number; onDone: () => void }) {
  const update = useUpdateShopSettings()
  const form = useForm<WhitesFeeFormValues>({
    initialValues: { whitesFee: initial },
    validate: schemaResolver(whitesFeeFormSchema, { sync: true }),
  })
  const submit = form.onSubmit((values) => {
    if (!form.isDirty()) return onDone()
    update.mutate(
      { whitesFee: Number(values.whitesFee) },
      {
        onSuccess: () => {
          notify.success('Đơn phân loại từ giờ dùng mức mới', 'Đã lưu phụ phí đồ trắng')
          onDone()
        },
        onError: (e) => notify.error(toApiError(e).message),
      },
    )
  })
  const cancelOnEscape = (e: React.KeyboardEvent) => e.key === 'Escape' && onDone()

  return (
    <form onSubmit={submit} onKeyDown={cancelOnEscape} noValidate>
      <Group align="flex-start" gap="xs" wrap="nowrap">
        <MoneyInput
          aria-label={TITLE}
          required
          autoFocus
          w={180}
          rightSection="đ/đơn"
          rightSectionWidth={56}
          {...form.getInputProps('whitesFee')}
        />
        <Button variant="subtle" color="gray" onClick={onDone}>
          Hủy
        </Button>
        <Button type="submit" loading={update.isPending}>
          Lưu
        </Button>
      </Group>
    </form>
  )
}
