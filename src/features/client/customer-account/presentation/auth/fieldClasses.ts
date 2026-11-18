export const FIELD_CLASSES = {
  label: 'mb-1.5! font-semibold! text-(length:--pub-text-md)! text-(--pub-ink)!',
  input:
    'h-12! rounded-(--pub-radius-btn)! border-(--pub-border)! bg-(--pub-surface)! text-(length:--pub-text-md)! focus:border-(--pub-primary)!',
  innerInput: 'h-12!',
  error: 'mt-1.5! text-(length:--pub-text-sm)! text-(--pub-danger)!',
  section: 'text-(--pub-ink-muted)!',
  required: 'ml-0.5! text-(--pub-danger)!',
}

export const FORM_ERROR_CLASS =
  'rounded-(--pub-radius-md) bg-(--pub-danger-soft) px-4 py-3 text-(length:--pub-text-sm) font-semibold text-(--pub-danger)'

// Nút hiện/ẩn mật khẩu mặc định của Mantine chỉ 28px và có nhãn tiếng Anh
export const PASSWORD_TOGGLE_PROPS = {
  'aria-label': 'Hiện hoặc ẩn mật khẩu',
  style: { width: 44, height: 44, minWidth: 44, minHeight: 44 },
}
