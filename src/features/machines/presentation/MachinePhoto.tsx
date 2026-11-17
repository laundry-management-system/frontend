import { AspectRatio, Center, Image } from '@mantine/core'
import { useState } from 'react'
import { LuWashingMachine, LuWind } from 'react-icons/lu'
import type { Machine } from '../domain/types'

interface MachinePhotoProps {
  machine: Pick<Machine, 'name' | 'type' | 'image'>
  radius?: string
  /** 4/3 cho ảnh lớn, 1 cho ảnh thu nhỏ trên thẻ */
  ratio?: number
  iconSize?: number
}

/** Ảnh máy; chưa có ảnh hoặc ảnh lỗi thì hiện hình minh họa theo loại. */
export function MachinePhoto({ machine, radius, ratio = 4 / 3, iconSize = 48 }: MachinePhotoProps) {
  const url = machine.image?.url
  const [brokenUrl, setBrokenUrl] = useState<string | null>(null)
  const Icon = machine.type === 'WASHER' ? LuWashingMachine : LuWind
  const markBroken = () => setBrokenUrl(url ?? null)

  return (
    <AspectRatio ratio={ratio}>
      {url && brokenUrl !== url ? (
        <Image
          src={url}
          alt={machine.name}
          fit="cover"
          loading="lazy"
          radius={radius}
          onError={markBroken}
        />
      ) : (
        <Center bg="var(--ds-accent)" c="var(--ds-accent-foreground)" bdrs={radius}>
          <Icon size={iconSize} aria-hidden />
        </Center>
      )}
    </AspectRatio>
  )
}
