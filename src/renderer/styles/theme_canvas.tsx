import {
  InputVariant,
  MantineProviderProps,
  MantineSize,
  MantineThemeOverride,
} from '@mantine/core'
import defaultTheme from '@/styles/mantineDefaultTheme'

// style variables that are the same for all themes
const fixedTheme = {
  // layout: general
  iconSize: 18,
  scrollbarSize: 12,
  // layout: canvas
  gridSize: 20,
  // layout: nodes
  nodeWidth: 300,
  nodePadding: 5,
  nodeFieldSpacing: 5,
  // layout: noodles
  handleSize: 14,
  handleDraggableSize: 40,
  // layout: fields
  fieldInnerMargin: 0,
  fieldLabelMargin: 8,
  fieldDefaultHeight: 30,
  fieldMaxHeight: 180,
  // radius
  fieldContainerRadius: 'md' as MantineSize, // only visible if theme.other.fieldBorder is set
  // debugging
  handleDraggableOpacity: 0,
  noodleBackgroundOpacity: 0,
}

// style variables that depend on the color scheme
const mantineTheme: MantineThemeOverride = {
  colorScheme: 'dark',
  fontFamily: defaultTheme.fontFamily,
  defaultRadius: 'md',
  primaryColor: 'blue',
  fontSizes: {
    "xs": 11,
    "sm": 13,
    "md": 14,
    "lg": 15,
    "xl": 16
  },
  other: {
    // colors
    canvasBackgroundColor: defaultTheme.colors.dark[7],
    nodeHeaderBackgroundColor: defaultTheme.colors.blue[9],
    nodeBackgroundColor: defaultTheme.colors.dark[5],
    fieldBackgroundColor: defaultTheme.colors.dark[5],
    socketColor: defaultTheme.colors.blue[9],
    iconColor: defaultTheme.colors.dark[0],
    textColor: defaultTheme.colors.gray[4],
    noodleColor: defaultTheme.colors.gray[2],
    scrollbarColor: 'rgba(0, 0, 0, 0.55)',
    scrollbarThumbColor: 'rgba(255, 255, 255, 0.4)',
    // shadows
    nodeContainerShadow: '0px 0px 5px rgba(0, 0, 0, 0.6)',
    fieldContainerShadow: 'none',
    // borders
    fieldBorder: '1px none rgba(255, 255, 255, 0.3)',
    nodeHoverOutline: `2px solid ${defaultTheme.colors.blue[9]}`,
    nodeActiveOutline: '2px solid rgba(255, 255, 255, 0.6)',
    // mantine-specific
    fieldComponentVariant: 'filled',
  },
}

declare module '@mantine/core' {
  export interface MantineThemeOther {
    // colors
    canvasBackgroundColor: string
    nodeBackgroundColor: string
    nodeHeaderBackgroundColor: string
    fieldBackgroundColor: string
    socketColor: string
    iconColor: string
    textColor: string
    noodleColor: string
    scrollbarColor: string
    scrollbarThumbColor: string
    // shadows
    nodeContainerShadow: string
    fieldContainerShadow: string
    // borders
    fieldBorder: string
    nodeHoverOutline: string
    nodeActiveOutline: string
    // mantine-specific
    fieldComponentVariant: InputVariant
  }
}

const styleOverrides: MantineProviderProps['styles'] = {
  Select: (theme) => ({
    filledVariant: {
      backgroundColor: theme.colors.dark[7],
    },
    input: {
      fontSize: theme.fontSizes.md,
      color: theme.other.textColor,
    },
  }),
  TextInput: (theme) => ({
    filledVariant: {
      backgroundColor: theme.colors.dark[7],
    },
    input: {
      fontSize: theme.fontSizes.md,
      color: theme.other.textColor,
    },
  }),
}

const classNames = {
  Select: { root: 'mantine-select-filled' },
}

export {
  fixedTheme,
  mantineTheme,
  styleOverrides,
  classNames,
}
