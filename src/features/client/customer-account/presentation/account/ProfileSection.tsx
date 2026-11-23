import { Skeleton, TextInput } from '@mantine/core'
import { schemaResolver, useForm } from '@mantine/form'
import { useState } from 'react'
import { toApiError } from '@/shared/common/api/apiError'
import { notify } from '@/shared/common/lib/notify'
import { formatPhone } from '@/shared/common/lib/format'
import { useUpdateMyProfile } from '../../application/mutations/useUpdateMyProfile'
import { useMyProfile } from '../../application/queries/useMyProfile'
import { type ProfileValues, profileSchema } from '../../application/schemas'
import type { CustomerProfile } from '../../domain/types'
import { ChangePasswordSection } from './ChangePasswordSection'
import { FIELD_CLASSES, FORM_ERROR_CLASS } from '../auth/fieldClasses'

const TERM = 'text-(--pub-ink-muted)'

function ProfileView({ profile, onEdit }: { profile: CustomerProfile; onEdit: () => void }) {
  return (
    <>
      <dl className="grid gap-x-4 gap-y-3 sm:grid-cols-[10rem_1fr]">
        <dt className={TERM}>Mã khách hàng</dt>
        <dd className="font-(family-name:--pub-font-mono)">{profile.customerCode}</dd>
        <dt className={TERM}>Họ tên</dt>
        <dd>{profile.fullName}</dd>
        <dt className={TERM}>Số điện thoại</dt>
        <dd>{formatPhone(profile.phone)}</dd>
        <dt className={TERM}>Email</dt>
        <dd>{profile.email ?? '—'}</dd>
        <dt className={TERM}>Địa chỉ</dt>
        <dd>{profile.address ?? '—'}</dd>
      </dl>
      <button type="button" onClick={onEdit} className="pub-btn pub-btn--ghost mt-6">
        Sửa
      </button>
    </>
  )
}

function ProfileEditForm({ profile, onClose }: { profile: CustomerProfile; onClose: () => void }) {
  const update = useUpdateMyProfile()
  const [error, setError] = useState<string | null>(null)
  const form = useForm<ProfileValues>({
    initialValues: {
      fullName: profile.fullName,
      email: profile.email ?? '',
      address: profile.address ?? '',
    },
    validate: schemaResolver(profileSchema, { sync: true }),
  })

  const submit = form.onSubmit((values) => {
    setError(null)
    update.mutate(values, {
      onSuccess: () => {
        notify.success('Đã lưu thông tin')
        onClose()
      },
      onError: (err) => {
        const apiError = toApiError(err)
        if (Object.keys(apiError.fieldErrors).some((k) => k in form.values))
          form.setErrors(apiError.fieldErrors)
        else setError(apiError.message)
      },
    })
  })

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-5">
      {error && (
        <p role="alert" className={FORM_ERROR_CLASS}>
          {error}
        </p>
      )}
      <TextInput
        label="Họ tên"
        withAsterisk
        autoFocus
        autoComplete="name"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('fullName')}
      />
      <TextInput
        label="Số điện thoại"
        value={formatPhone(profile.phone)}
        readOnly
        description="Liên hệ tiệm để đổi số"
        classNames={FIELD_CLASSES}
      />
      <TextInput
        label="Email"
        type="email"
        autoComplete="email"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('email')}
      />
      <TextInput
        label="Địa chỉ"
        autoComplete="street-address"
        classNames={FIELD_CLASSES}
        {...form.getInputProps('address')}
      />
      <div className="flex flex-wrap gap-3">
        <button type="button" onClick={onClose} className="pub-btn pub-btn--ghost">
          Hủy
        </button>
        <button
          type="submit"
          disabled={update.isPending}
          className="pub-btn pub-btn--primary disabled:opacity-60"
        >
          {update.isPending ? 'Đang lưu…' : 'Lưu'}
        </button>
      </div>
    </form>
  )
}

export function ProfileSection() {
  const { data, isPending, isError, refetch } = useMyProfile()
  const [editing, setEditing] = useState(false)
  const handleEdit = () => setEditing(true)
  const handleClose = () => setEditing(false)
  const handleRetry = () => refetch()

  let body
  if (data) {
    body = editing ? (
      <ProfileEditForm profile={data} onClose={handleClose} />
    ) : (
      <ProfileView profile={data} onEdit={handleEdit} />
    )
  } else if (isPending) {
    body = <Skeleton h={160} radius="md" aria-hidden="true" />
  } else if (isError) {
    body = (
      <div role="alert" className="flex flex-col items-start gap-3">
        <p>Không tải được thông tin tài khoản.</p>
        <button type="button" onClick={handleRetry} className="pub-btn pub-btn--ghost">
          Thử lại
        </button>
      </div>
    )
  }

  return (
    <>
      <section aria-labelledby="thong-tin-title" className="pub-card p-6">
        <h2 id="thong-tin-title" className="mb-5 text-(length:--pub-text-xl)">
          Thông tin
        </h2>
        {body}
      </section>
      {data && editing && <ChangePasswordSection />}
    </>
  )
}
