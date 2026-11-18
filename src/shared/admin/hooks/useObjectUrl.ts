import { useEffect, useState } from 'react'

/**
 * URL xem trước cho File (ảnh chụp/chọn tại chỗ), tự thu hồi khi đổi file hoặc unmount.
 * Tạo và thu hồi trong cùng một effect: StrictMode chạy effect 2 lần vẫn có URL hợp lệ.
 */
export function useObjectUrl(file: File | null | undefined) {
  const [url, setUrl] = useState<string>()
  useEffect(() => {
    if (!file) return
    const next = URL.createObjectURL(file)
    // eslint-disable-next-line react-hooks/set-state-in-effect -- URL phải tạo trong effect để thu hồi đúng cặp
    setUrl(next)
    return () => {
      URL.revokeObjectURL(next)
      setUrl(undefined)
    }
  }, [file])
  return url
}
