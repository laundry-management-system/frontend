import { Box, Button, FileButton, Group, Input, LoadingOverlay } from '@mantine/core'
import { type ReactNode, useEffect, useState } from 'react'
import { LuImagePlus, LuTrash2 } from 'react-icons/lu'
import { toApiError } from '@/shared/api/apiError'
import { useUploadMachineImage } from '../application/useUploadMachineImage'
import { imageFileError } from '@/shared/lib/imageFile'
import type { MachineImage, MachineType } from '../domain/types'
import { MachinePhoto } from './MachinePhoto'

interface MachineImageFieldProps {
  value: MachineImage | null
  onChange: (image: MachineImage | null) => void
  onUploadingChange: (uploading: boolean) => void
  type: MachineType
  error?: ReactNode
}

const ACCEPT = 'image/png,image/jpeg,image/webp'
const FRAME = { borderRadius: 'var(--radius-control)', overflow: 'hidden' } as const

// shortcut: ảnh đã tải nhưng không gắn vào máy (bỏ form, đổi ảnh) vẫn nằm trong documents, dọn khi có job dọn file mồ côi
export function MachineImageField(props: MachineImageFieldProps) {
  const { value, onChange, onUploadingChange, type, error } = props
  const upload = useUploadMachineImage()
  const [localError, setLocalError] = useState<string | null>(null)

  useEffect(() => onUploadingChange(upload.isPending), [upload.isPending, onUploadingChange])

  const pickFile = (file: File | null) => {
    if (!file) return
    const invalid = imageFileError(file)
    setLocalError(invalid)
    if (invalid) return
    upload.mutate(file, {
      onSuccess: (doc) => onChange({ id: doc.id, url: doc.url }),
      onError: (e) => setLocalError(toApiError(e).message),
    })
  }
  const removeImage = () => onChange(null)

  const pickButton = (
    <FileButton accept={ACCEPT} onChange={pickFile}>
      {(props) => (
        <Button {...props} variant="secondary" size="xs" leftSection={<LuImagePlus size={14} />}>
          {value ? 'Đổi ảnh' : 'Chọn ảnh'}
        </Button>
      )}
    </FileButton>
  )

  return (
    <Input.Wrapper label="Ảnh máy" error={error ?? localError}>
      <Box
        pos="relative"
        maw={240}
        mb={6}
        style={{ ...FRAME, border: value ? undefined : '1px dashed var(--ds-border)' }}
      >
        <LoadingOverlay visible={upload.isPending} />
        <MachinePhoto machine={{ name: 'Ảnh máy', type, image: value }} />
      </Box>
      <Group gap="xs">
        {pickButton}
        {value && (
          <Button
            variant="subtle"
            color="danger"
            size="xs"
            leftSection={<LuTrash2 size={14} />}
            onClick={removeImage}
          >
            Bỏ ảnh
          </Button>
        )}
      </Group>
    </Input.Wrapper>
  )
}
