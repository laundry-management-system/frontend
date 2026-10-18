import {
  ActionIcon,
  Badge,
  Button,
  Card,
  Checkbox,
  createTheme,
  defaultVariantColorsResolver,
  Input,
  InputWrapper,
  Modal,
  NavLink,
  Notification,
  Radio,
  SegmentedControl,
  Switch,
  Table,
  Tooltip,
  type ButtonVariant,
  type CSSVariablesResolver,
  type MantineColorsTuple,
  type VariantColorsResolver,
} from '@mantine/core'

const palette = (hue: string, steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]) =>
  steps.map((s) => `var(--color-${hue}-${s})`) as unknown as MantineColorsTuple

const TONES = ['primary', 'neutral', 'info', 'success', 'warning', 'express', 'danger', 'vip']

const DENSITY_SIZES = ['sm', 'md', 'lg']
const densityVar = (size: unknown, token: string) => {
  const s = size ?? 'md'
  return typeof s === 'string' && DENSITY_SIZES.includes(s)
    ? `var(--ds-control-${token}-${s})`
    : undefined
}

const variantColorResolver: VariantColorsResolver = (input) => {
  const { color, variant, theme } = input
  const tone = color && TONES.includes(color) ? color : undefined
  const isPrimary = color === undefined || color === theme.primaryColor || color === 'primary'

  if (variant === 'secondary')
    return {
      background: 'var(--ds-secondary)',
      hover: 'var(--ds-secondary-hover)',
      color: 'var(--ds-secondary-foreground)',
      border: '1px solid transparent',
    }
  if (variant === 'filled' && color === 'danger')
    return {
      background: 'var(--ds-destructive)',
      hover: 'var(--ds-destructive-hover)',
      color: 'var(--ds-destructive-foreground)',
      border: '1px solid transparent',
    }
  if (variant === 'filled' && isPrimary)
    return {
      background: 'var(--ds-primary)',
      hover: 'var(--ds-primary-hover)',
      color: 'var(--ds-primary-foreground)',
      border: '1px solid transparent',
    }
  if (tone) {
    const t = (part: string) => `var(--tone-${tone}-${part})`
    if (variant === 'filled')
      return {
        background: t('solid'),
        hover: t('solid'),
        color: t('solid-fg'),
        border: '1px solid transparent',
      }
    if (variant === 'light')
      return {
        background: t('bg'),
        hover: t('border'),
        color: t('fg'),
        border: `1px solid ${t('border')}`,
      }
    if (variant === 'outline')
      return {
        background: 'transparent',
        hover: t('bg'),
        color: t('fg'),
        border: `1px solid ${t('solid')}`,
      }
    if (variant === 'subtle')
      return {
        background: 'transparent',
        hover: t('bg'),
        color: t('fg'),
        border: '1px solid transparent',
      }
  }
  return defaultVariantColorsResolver(input)
}

// Biến nội bộ của Mantine (nền, chữ, viền input…) → token DS; --ds-* tự đổi theo Light/Dark
const dsVariables = {
  '--mantine-color-body': 'var(--ds-background)',
  '--mantine-color-text': 'var(--ds-foreground)',
  '--mantine-color-dimmed': 'var(--ds-muted-foreground)',
  '--mantine-color-placeholder': 'var(--ds-muted-foreground)',
  '--mantine-color-error': 'var(--ds-destructive)',
  '--mantine-color-default': 'var(--ds-card)',
  '--mantine-color-default-hover': 'var(--ds-muted)',
  '--mantine-color-default-color': 'var(--ds-foreground)',
  '--mantine-color-default-border': 'var(--ds-input)',
  '--mantine-color-anchor': 'var(--ds-primary)',
}

export const cssVariablesResolver: CSSVariablesResolver = () => ({
  variables: {},
  light: dsVariables,
  dark: dsVariables,
})

export const theme = createTheme({
  colors: {
    teal: palette('teal'),
    blue: palette('blue'),
    green: palette('green'),
    orange: palette('orange'),
    red: palette('red'),
    violet: palette('violet'),
    gray: palette('slate'),
    yellow: palette('amber'),
    dark: palette('slate', [200, 300, 400, 500, 700, 800, 900, 950, 950, 950]),
  },
  primaryColor: 'teal',
  primaryShade: { light: 7, dark: 4 },
  variantColorResolver,
  focusClassName: 'ds-focus',
  fontFamily: 'var(--font-sans)',
  fontFamilyMonospace: 'var(--font-mono)',
  headings: {
    fontFamily: 'var(--font-sans)',
    sizes: {
      h1: { fontSize: '30px', lineHeight: '38px', fontWeight: '700' },
      h2: { fontSize: '24px', lineHeight: '32px', fontWeight: '600' },
      h3: { fontSize: '20px', lineHeight: '28px', fontWeight: '600' },
      h4: { fontSize: '18px', lineHeight: '26px', fontWeight: '600' },
    },
  },
  // Caption / Body Small / Body Medium / Body Large / H4
  fontSizes: { xs: '12px', sm: '13px', md: '14px', lg: '16px', xl: '18px' },
  radius: {
    xs: 'var(--radius-sm)',
    sm: 'var(--radius-md)',
    md: 'var(--radius-lg)',
    lg: 'var(--radius-xl)',
    xl: 'var(--radius-2xl)',
  },
  defaultRadius: 'md',
  shadows: {
    xs: 'var(--shadow-xs)',
    sm: 'var(--shadow-sm)',
    md: 'var(--shadow-md)',
    lg: 'var(--shadow-lg)',
    xl: 'var(--shadow-xl)',
  },
  components: {
    Button: Button.extend({
      defaultProps: { size: 'md' },
      vars: (_, props) => ({
        root: {
          '--button-height': densityVar(props.size, 'height'),
          '--button-padding-x': densityVar(props.size, 'padding-x'),
        },
      }),
    }),
    ActionIcon: ActionIcon.extend({
      defaultProps: { size: 'md' },
      vars: (_, props) => ({ root: { '--ai-size': densityVar(props.size, 'height') } }),
    }),
    Input: Input.extend({
      defaultProps: { size: 'md' },
      vars: (_, props) => ({ wrapper: { '--input-height': densityVar(props.size, 'height') } }),
    }),
    InputWrapper: InputWrapper.extend({
      styles: {
        label: { marginBottom: 'calc(var(--ds-control-gap) - var(--mantine-spacing-xs) / 2)' },
      },
    }),
    SegmentedControl: SegmentedControl.extend({
      styles: {
        label: {
          minHeight: 'calc(var(--ds-control-height-md) - 8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        },
      },
    }),
    Checkbox: Checkbox.extend({
      styles: { body: { minHeight: 'var(--ds-control-height-sm)', alignItems: 'center' } },
    }),
    Radio: Radio.extend({
      styles: { body: { minHeight: 'var(--ds-control-height-sm)', alignItems: 'center' } },
    }),
    Switch: Switch.extend({
      styles: { body: { minHeight: 'var(--ds-control-height-sm)', alignItems: 'center' } },
    }),
    Table: Table.extend({
      vars: () => ({ table: { '--table-horizontal-spacing': 'var(--ds-table-cell-padding-x)' } }),
      styles: {
        th: {
          height: 'var(--ds-table-header-height)',
          backgroundColor: 'var(--ds-muted)',
          color: 'var(--ds-muted-foreground)',
          fontSize: 11,
          fontWeight: 600,
          lineHeight: '16px',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        },
        td: { height: 'var(--ds-table-row-height)' },
      },
    }),
    Card: Card.extend({
      defaultProps: {
        radius: 'lg',
        shadow: 'xs',
        withBorder: true,
        padding: 'var(--ds-card-padding)',
      },
    }),
    // DS: cao 24/20px, chữ 12px Medium, không viết hoa
    Badge: Badge.extend({
      defaultProps: { radius: 'var(--radius-pill)', variant: 'light', size: 'md' },
      vars: (_, props) => ({
        root: {
          '--badge-height': props.size === 'sm' ? '20px' : '24px',
          '--badge-padding-x': props.size === 'sm' ? '6px' : '8px',
          '--badge-fz': '12px',
        },
      }),
      styles: { root: { textTransform: 'none', fontWeight: 500 } },
    }),
    Tooltip: Tooltip.extend({ defaultProps: { withArrow: true } }),
    Modal: Modal.extend({
      defaultProps: {
        radius: 'lg',
        shadow: 'xl',
        padding: 24,
        overlayProps: { color: 'var(--ds-overlay)', backgroundOpacity: 1 },
      },
      styles: {
        header: { borderBottom: '1px solid var(--ds-border)' },
        body: { paddingTop: 'var(--mb-padding)' },
        title: { fontSize: 20, fontWeight: 600, lineHeight: '25px', letterSpacing: '-0.005em' },
      },
    }),
    NavLink: NavLink.extend({ defaultProps: { color: 'primary', variant: 'light' } }),
    // DS Toast: nền popover, viền, shadow lg; icon tô màu tone/<tone>/solid, bỏ nền tròn mặc định
    Notification: Notification.extend({
      defaultProps: { radius: 'lg', withBorder: true },
      styles: (_theme, props) => ({
        root: { padding: 16, boxShadow: 'var(--mantine-shadow-lg)', width: 380, maxWidth: '100%' },
        icon: {
          backgroundColor: 'transparent',
          color: `var(--tone-${props.color}-solid)`,
          width: 20,
          height: 20,
        },
        title: { fontWeight: 600 },
        description: { color: 'var(--ds-muted-foreground)' },
      }),
    }),
  },
})

type ExtendedButtonVariant = ButtonVariant | 'secondary'

declare module '@mantine/core' {
  export interface ButtonProps {
    variant?: ExtendedButtonVariant
  }
}
