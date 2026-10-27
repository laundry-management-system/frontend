import { Button, Card, Divider, Flex, Group, Stack, Text, Title } from '@mantine/core'
import { useForm } from '@mantine/form'
import { type FormEvent, Fragment, useEffect, useState } from 'react'
import { LuPencil } from 'react-icons/lu'
import { useBlocker } from 'react-router-dom'
import { formatDateTime } from '@/shared/lib/format'
import { notify } from '@/shared/lib/notify'
import { ConfirmModal, PageHeader } from '@/shared/ui'
import { useSaveSettings } from '../application/useSaveSettings'
import { fieldOf, SETTING_FIELDS, SETTING_GROUP_TITLE } from '../domain/settingFields'
import type { Setting, SettingGroup } from '../domain/types'
import { validateOpeningHours, validateSetting } from '../domain/validate'
import { SettingInput } from './SettingInput'

const LEFT: SettingGroup[] = ['RECEIPT', 'VIETQR']
const RIGHT: SettingGroup[] = ['OPERATION', 'SECURITY', 'OTHER']

type Values = Record<string, string>

const toValues = (settings: Setting[]): Values =>
  Object.fromEntries(settings.map((s) => [s.key, s.value]))

function validateAll(values: Values): Values {
  const errors: Values = {}
  for (const [key, value] of Object.entries(values)) {
    const error = validateSetting(fieldOf(key).type, value)
    if (error) errors[key] = error
  }
  const hours = validateOpeningHours(values.OPENING_TIME ?? '', values.CLOSING_TIME ?? '')
  if (hours && !errors.CLOSING_TIME) errors.CLOSING_TIME = hours
  return errors
}

export function SettingsForm({ settings }: { settings: Setting[] }) {
  const save = useSaveSettings()
  const [editing, setEditing] = useState(false)
  // Lỗi định dạng tính lại mỗi lần render; form.errors chỉ giữ lỗi BE trả về cho từng ô
  const form = useForm<Values>({ initialValues: toValues(settings) })
  const initial = form.getInitialValues()
  const dirtyKeys = Object.keys(form.values).filter(
    (k) => form.values[k].trim() !== (initial[k] ?? ''),
  )
  const errors = validateAll(form.values)
  const hasErrors = Object.keys(errors).length > 0
  const dirty = dirtyKeys.length > 0

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

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!dirty || hasErrors) return
    const changes = dirtyKeys.map((key) => ({ key, value: form.values[key] }))
    save.mutate(changes, {
      onSuccess: ({ saved, failed }) => {
        form.setInitialValues({
          ...form.getInitialValues(),
          ...Object.fromEntries(saved.map((s) => [s.key, s.value])),
        })
        saved.forEach((s) => form.setFieldValue(s.key, s.value))
        failed.forEach((f) => form.setFieldError(f.key, f.message))
        if (failed.length === 0) {
          notify.success(`Đã lưu ${saved.length} thay đổi`)
          setEditing(false)
        } else notify.warning(`Đã lưu ${saved.length}/${changes.length}. Kiểm tra các ô báo lỗi`)
      },
    })
  }
  const startEdit = () => setEditing(true)
  const cancelEdit = () => {
    form.reset()
    setEditing(false)
  }
  const cancelLeave = () => blocker.reset?.()
  const confirmLeave = () => blocker.proceed?.()

  const updatedAt = Object.fromEntries(settings.map((s) => [s.key, s.updatedAt]))
  const unknownKeys = settings.map((s) => s.key).filter((k) => fieldOf(k).group === 'OTHER')
  const keysOf = (group: SettingGroup) =>
    group === 'OTHER'
      ? unknownKeys
      : SETTING_FIELDS.filter((f) => f.group === group && f.key in form.values).map((f) => f.key)

  const renderGroup = (group: SettingGroup) => {
    const keys = keysOf(group)
    if (!keys.length) return null
    // ISO cùng định dạng nên so chuỗi là so thời gian
    const lastUpdated = keys
      .map((k) => updatedAt[k])
      .filter(Boolean)
      .sort()
      .at(-1)
    return (
      <Card key={group}>
        <Stack gap={editing ? 'md' : 'sm'}>
          <Group justify="space-between" align="baseline" mb={4}>
            <Title order={5}>{SETTING_GROUP_TITLE[group]}</Title>
            {lastUpdated && (
              <Text size="xs" c="dimmed">
                Cập nhật {formatDateTime(lastUpdated).slice(0, 16)}
              </Text>
            )}
          </Group>
          {keys.map((key, i) => (
            <Fragment key={key}>
              {!editing && i > 0 && <Divider />}
              <SettingInput
                field={fieldOf(key)}
                value={form.values[key]}
                error={(form.errors[key] as string | undefined) ?? errors[key]}
                editing={editing}
                onChange={(v) => form.setFieldValue(key, v)}
              />
            </Fragment>
          ))}
        </Stack>
      </Card>
    )
  }

  const headerActions = editing ? (
    <Group gap="sm">
      <Button variant="subtle" color="gray" onClick={cancelEdit} disabled={save.isPending}>
        Hủy
      </Button>
      <Button type="submit" disabled={!dirty || hasErrors} loading={save.isPending}>
        Lưu
      </Button>
    </Group>
  ) : (
    <Button variant="default" leftSection={<LuPencil size={16} />} onClick={startEdit}>
      Chỉnh sửa
    </Button>
  )

  return (
    <form onSubmit={handleSubmit} noValidate>
      <PageHeader
        title="Cài đặt cửa hàng"
        description="Áp dụng cho toàn hệ thống"
        info="Mọi thay đổi được ghi vào Nhật ký hệ thống"
        actions={headerActions}
      />
      <Flex direction={{ base: 'column', md: 'row' }} gap="lg" align="flex-start">
        <Stack gap="lg" flex={1} w="100%">
          {LEFT.map(renderGroup)}
        </Stack>
        <Stack gap="lg" flex={1} w="100%">
          {RIGHT.map(renderGroup)}
        </Stack>
      </Flex>
      <ConfirmModal
        opened={blocker.state === 'blocked'}
        kind="destructive"
        title="Bỏ thay đổi chưa lưu?"
        confirmLabel="Bỏ thay đổi"
        onClose={cancelLeave}
        onConfirm={confirmLeave}
      >
        Các cài đặt vừa sửa sẽ mất nếu rời trang.
      </ConfirmModal>
    </form>
  )
}
